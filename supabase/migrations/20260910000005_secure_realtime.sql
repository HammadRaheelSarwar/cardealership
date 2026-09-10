-- Lock browser subscriptions to authenticated members and publish live CRM changes.
CREATE OR REPLACE FUNCTION public.is_dealership_member(target_dealership_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.dealership_memberships
    WHERE dealership_id = target_dealership_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_dealership_member(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_dealership_member(UUID) TO authenticated, service_role;

DROP POLICY IF EXISTS "Profiles Access Policy" ON public.profiles;
DROP POLICY IF EXISTS "Dealerships Access Policy" ON public.dealerships;
DROP POLICY IF EXISTS "Dealership Memberships Access Policy" ON public.dealership_memberships;

CREATE POLICY "Members can read dealership profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid() OR EXISTS (
    SELECT 1
    FROM public.dealership_memberships visible_membership
    WHERE visible_membership.user_id = profiles.id
      AND visible_membership.status = 'active'
      AND public.is_dealership_member(visible_membership.dealership_id)
  )
);

CREATE POLICY "Members can read dealerships"
ON public.dealerships FOR SELECT TO authenticated
USING (public.is_dealership_member(id));

CREATE POLICY "Members can read memberships"
ON public.dealership_memberships FOR SELECT TO authenticated
USING (public.is_dealership_member(dealership_id));

REVOKE ALL ON public.profiles, public.dealerships, public.dealership_memberships FROM anon;
GRANT SELECT ON public.profiles, public.dealerships, public.dealership_memberships TO authenticated;

DO $$
DECLARE
  table_name TEXT;
  policy_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'customers', 'vehicles', 'vehicle_images', 'leads', 'lead_sources',
    'pipeline_stages', 'conversations', 'messages', 'activities', 'tasks',
    'appointments', 'notes', 'automations', 'automation_steps',
    'automation_runs', 'automation_logs', 'message_templates', 'audit_logs',
    'manager_team_members', 'lead_stage_history', 'sales_records'
  ] LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', table_name);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', table_name);

    FOR policy_name IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_dealership_member(dealership_id))',
      'Authenticated members can read ' || table_name,
      table_name
    );
  END LOOP;
END $$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'dealerships', 'dealership_memberships', 'manager_team_members',
    'lead_sources', 'pipeline_stages', 'customers', 'vehicles', 'vehicle_images',
    'leads', 'lead_stage_history', 'conversations', 'messages', 'activities',
    'tasks', 'appointments', 'notes', 'sales_records', 'automations',
    'automation_steps', 'automation_runs', 'automation_logs',
    'message_templates', 'audit_logs'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', table_name);
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END $$;
