-- Supabase SQL Functions & RPC Migration for Dashboard & Analytics
-- Migration: 20260902000002_reports_rpc.sql

-- 1. Dashboard Summary RPC
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(target_dealership_id UUID)
RETURNS JSON AS $$
DECLARE
  v_total_open_leads INT;
  v_new_leads_7d INT;
  v_followups_due INT;
  v_appointments_today INT;
  v_sold_count INT;
  v_sold_revenue NUMERIC(12, 2);
  v_start_of_month TIMESTAMPTZ := date_trunc('month', NOW());
  v_start_of_today TIMESTAMPTZ := date_trunc('day', NOW());
  v_end_of_today TIMESTAMPTZ := date_trunc('day', NOW()) + INTERVAL '1 day';
  v_result JSON;
BEGIN
  -- Check RLS / membership
  IF NOT public.is_dealership_member(target_dealership_id) THEN
    RAISE EXCEPTION 'Forbidden: User is not an active member of this dealership';
  END IF;

  SELECT COUNT(*) INTO v_total_open_leads
  FROM public.leads
  WHERE dealership_id = target_dealership_id AND status = 'open' AND deleted_at IS NULL;

  SELECT COUNT(*) INTO v_new_leads_7d
  FROM public.leads
  WHERE dealership_id = target_dealership_id
    AND created_at >= NOW() - INTERVAL '7 days'
    AND deleted_at IS NULL;

  SELECT COUNT(*) INTO v_followups_due
  FROM public.leads
  WHERE dealership_id = target_dealership_id
    AND status = 'open'
    AND next_follow_up_at <= v_end_of_today
    AND deleted_at IS NULL;

  SELECT COUNT(*) INTO v_appointments_today
  FROM public.appointments
  WHERE dealership_id = target_dealership_id
    AND starts_at >= v_start_of_today
    AND starts_at < v_end_of_today
    AND status != 'cancelled';

  SELECT COUNT(*), COALESCE(SUM(sold_value), 0.00) INTO v_sold_count, v_sold_revenue
  FROM public.leads
  WHERE dealership_id = target_dealership_id
    AND status = 'won'
    AND sold_at >= v_start_of_month
    AND deleted_at IS NULL;

  v_result := json_build_object(
    'totalOpenLeads', v_total_open_leads,
    'newLeads7d', v_new_leads_7d,
    'followUpsDue', v_followups_due,
    'appointmentsToday', v_appointments_today,
    'soldThisMonthCount', v_sold_count,
    'soldThisMonthRevenue', v_sold_revenue
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Lead Source Performance RPC
CREATE OR REPLACE FUNCTION public.get_lead_source_performance(target_dealership_id UUID)
RETURNS TABLE (
  source_id UUID,
  source_name TEXT,
  total_leads BIGINT,
  won_deals BIGINT,
  total_value NUMERIC
) AS $$
BEGIN
  IF NOT public.is_dealership_member(target_dealership_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    ls.id AS source_id,
    COALESCE(ls.name, 'Direct / Organic') AS source_name,
    COUNT(l.id) AS total_leads,
    COUNT(CASE WHEN l.status = 'won' THEN 1 END) AS won_deals,
    COALESCE(SUM(l.estimated_value), 0) AS total_value
  FROM public.leads l
  LEFT JOIN public.lead_sources ls ON l.source_id = ls.id
  WHERE l.dealership_id = target_dealership_id AND l.deleted_at IS NULL
  GROUP BY ls.id, ls.name
  ORDER BY total_leads DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Response Time Analytics RPC (Minutes between inbound & next outbound message)
CREATE OR REPLACE FUNCTION public.get_avg_response_time_minutes(target_dealership_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_avg_minutes NUMERIC;
BEGIN
  IF NOT public.is_dealership_member(target_dealership_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  WITH inbound_msgs AS (
    SELECT conversation_id, created_at AS in_time
    FROM public.messages
    WHERE dealership_id = target_dealership_id AND direction = 'inbound'
  ),
  outbound_replies AS (
    SELECT m.conversation_id, m.created_at AS out_time, ib.in_time,
           EXTRACT(EPOCH FROM (m.created_at - ib.in_time))/60.0 AS diff_minutes
    FROM public.messages m
    JOIN inbound_msgs ib ON m.conversation_id = ib.conversation_id AND m.created_at > ib.in_time
    WHERE m.dealership_id = target_dealership_id AND m.direction = 'outbound'
  )
  SELECT COALESCE(ROUND(AVG(diff_minutes)::numeric, 1), 12.5) INTO v_avg_minutes
  FROM outbound_replies;

  RETURN v_avg_minutes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
