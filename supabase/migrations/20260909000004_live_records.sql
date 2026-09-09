-- Persist every stage transition, including changes made outside the CRM API.
CREATE OR REPLACE FUNCTION public.record_lead_stage_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.pipeline_stage_id IS DISTINCT FROM OLD.pipeline_stage_id AND NEW.pipeline_stage_id IS NOT NULL THEN
  INSERT INTO lead_stage_history(dealership_id,lead_id,from_stage_id,to_stage_id)
  VALUES(NEW.dealership_id,NEW.id,OLD.pipeline_stage_id,NEW.pipeline_stage_id);
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS crm_record_stage_change ON public.leads;
CREATE TRIGGER crm_record_stage_change AFTER UPDATE OF pipeline_stage_id ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.record_lead_stage_change();

-- Close a deal and write its ledger entry as one transaction. The lead lock prevents duplicate sales on retries.
CREATE OR REPLACE FUNCTION public.close_crm_deal(
 p_dealership_id uuid,p_lead_id uuid,p_actor_id uuid,p_sale_value numeric,
 p_gross_profit numeric DEFAULT NULL,p_net_profit numeric DEFAULT NULL,p_vehicle_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_lead leads%ROWTYPE; v_stage uuid; v_vehicle uuid; v_role text; v_sale_id uuid;
BEGIN
 SELECT role INTO v_role FROM dealership_memberships WHERE dealership_id=p_dealership_id AND user_id=p_actor_id AND status='active';
 IF v_role IS NULL THEN RAISE EXCEPTION 'Dealership membership required'; END IF;
 SELECT * INTO v_lead FROM leads WHERE id=p_lead_id AND dealership_id=p_dealership_id AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Lead not found'; END IF;
 IF v_role='salesperson' AND v_lead.assigned_user_id IS DISTINCT FROM p_actor_id THEN RAISE EXCEPTION 'Lead is not assigned to this salesperson'; END IF;
 IF p_sale_value IS NULL OR p_sale_value<0 THEN RAISE EXCEPTION 'A nonnegative sale value is required'; END IF;
 v_vehicle:=COALESCE(p_vehicle_id,v_lead.vehicle_id);
 IF v_vehicle IS NOT NULL AND NOT EXISTS(SELECT 1 FROM vehicles WHERE id=v_vehicle AND dealership_id=p_dealership_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Vehicle not found'; END IF;
 SELECT id INTO v_sale_id FROM sales_records WHERE lead_id=p_lead_id AND dealership_id=p_dealership_id LIMIT 1;
 IF v_lead.status='won' AND v_sale_id IS NOT NULL THEN RETURN to_jsonb(v_lead); END IF;
 SELECT id INTO v_stage FROM pipeline_stages WHERE dealership_id=p_dealership_id AND type='won' ORDER BY sort_order LIMIT 1;
 IF v_stage IS NULL THEN RAISE EXCEPTION 'Configure a Sold pipeline stage first'; END IF;
 UPDATE leads SET status='won',sold_at=now(),sold_value=p_sale_value,vehicle_id=v_vehicle,pipeline_stage_id=v_stage,updated_at=now() WHERE id=p_lead_id RETURNING * INTO v_lead;
 INSERT INTO sales_records(dealership_id,lead_id,vehicle_id,salesperson_id,sale_date,sale_value,gross_profit,net_profit)
 VALUES(p_dealership_id,p_lead_id,v_vehicle,v_lead.assigned_user_id,now(),p_sale_value,p_gross_profit,p_net_profit);
 UPDATE vehicles SET status='sold',updated_at=now() WHERE id=v_vehicle AND dealership_id=p_dealership_id;
 UPDATE tasks SET status='cancelled',updated_at=now() WHERE lead_id=p_lead_id AND dealership_id=p_dealership_id AND status='pending';
 INSERT INTO activities(dealership_id,lead_id,customer_id,user_id,type,title,description)
 VALUES(p_dealership_id,p_lead_id,v_lead.customer_id,p_actor_id,'deal_closed','Vehicle sold',p_sale_value::text);
 RETURN to_jsonb(v_lead);
END $$;
REVOKE ALL ON FUNCTION public.close_crm_deal(uuid,uuid,uuid,numeric,numeric,numeric,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.close_crm_deal(uuid,uuid,uuid,numeric,numeric,numeric,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.complete_crm_task(p_dealership_id uuid,p_task_id uuid,p_actor_id uuid,p_outcome text,p_note text DEFAULT NULL,p_next_task jsonb DEFAULT NULL,p_lost_reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_task tasks%ROWTYPE; v_lead leads%ROWTYPE; v_stage pipeline_stages%ROWTYPE; v_target pipeline_stages%ROWTYPE; v_role text;
BEGIN
 SELECT role INTO v_role FROM dealership_memberships WHERE dealership_id=p_dealership_id AND user_id=p_actor_id AND status='active';
 IF v_role IS NULL THEN RAISE EXCEPTION 'Dealership membership required'; END IF;
 SELECT * INTO v_task FROM tasks WHERE id=p_task_id AND dealership_id=p_dealership_id AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Task not found'; END IF;
 IF v_role='salesperson' AND v_task.assigned_user_id IS DISTINCT FROM p_actor_id THEN RAISE EXCEPTION 'Task is not assigned to this salesperson'; END IF;
 IF v_task.status='completed' THEN RETURN jsonb_build_object('taskId',v_task.id,'outcome',v_task.outcome); END IF;
 IF v_task.status<>'pending' THEN RAISE EXCEPTION 'Only pending tasks can be completed'; END IF;
 IF p_outcome NOT IN ('spoke_with_customer','no_answer','left_voicemail','text_sent','email_sent','appointment_set','moved_to_next_stage','not_interested','purchased_elsewhere','follow_up_needed') THEN RAISE EXCEPTION 'Invalid task outcome'; END IF;
 SELECT * INTO v_lead FROM leads WHERE id=v_task.lead_id AND dealership_id=p_dealership_id FOR UPDATE;
 IF FOUND AND v_lead.status='open' THEN
  SELECT * INTO v_stage FROM pipeline_stages WHERE id=v_lead.pipeline_stage_id AND dealership_id=p_dealership_id;
  IF p_outcome='moved_to_next_stage' THEN
   SELECT * INTO v_target FROM pipeline_stages WHERE dealership_id=p_dealership_id AND type='standard' AND sort_order>v_stage.sort_order ORDER BY sort_order LIMIT 1;
  ELSIF p_outcome='appointment_set' THEN
   SELECT * INTO v_target FROM pipeline_stages WHERE dealership_id=p_dealership_id AND slug IN ('appointment-set','appointment') ORDER BY sort_order LIMIT 1;
  ELSIF p_outcome IN ('not_interested','purchased_elsewhere') THEN
   SELECT * INTO v_target FROM pipeline_stages WHERE dealership_id=p_dealership_id AND type='lost' ORDER BY sort_order LIMIT 1;
  END IF;
  IF v_target.id IS NOT NULL THEN
   UPDATE leads SET pipeline_stage_id=v_target.id,status=CASE WHEN v_target.type='lost' THEN 'lost' ELSE 'open' END,lost_reason=COALESCE(p_lost_reason,lost_reason),updated_at=now() WHERE id=v_lead.id;
  END IF;
 END IF;
 UPDATE tasks SET status='completed',outcome=p_outcome,completed_by_user_id=p_actor_id,completed_at=now(),updated_at=now() WHERE id=v_task.id;
 IF p_next_task IS NOT NULL THEN
  IF NULLIF(p_next_task->>'title','') IS NULL OR NULLIF(p_next_task->>'dueAt','') IS NULL THEN RAISE EXCEPTION 'Follow-up title and due date are required'; END IF;
  INSERT INTO tasks(dealership_id,lead_id,customer_id,assigned_user_id,created_by_user_id,title,description,type,due_at,status)
  VALUES(p_dealership_id,v_task.lead_id,v_task.customer_id,v_task.assigned_user_id,p_actor_id,p_next_task->>'title',p_next_task->>'description',COALESCE(p_next_task->>'type','follow_up'),(p_next_task->>'dueAt')::timestamptz,'pending');
 END IF;
 INSERT INTO activities(dealership_id,lead_id,customer_id,user_id,type,title,description)
 VALUES(p_dealership_id,v_task.lead_id,v_task.customer_id,p_actor_id,'task_completed',v_task.title,COALESCE(p_note,p_outcome));
 RETURN jsonb_build_object('taskId',v_task.id,'outcome',p_outcome,'nextStage',v_target.slug);
END $$;
REVOKE ALL ON FUNCTION public.complete_crm_task(uuid,uuid,uuid,text,text,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_crm_task(uuid,uuid,uuid,text,text,jsonb,text) TO service_role;
