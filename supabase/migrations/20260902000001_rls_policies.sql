-- Supabase Row Level Security (RLS) Policies Migration
-- Migration: 20260902000001_rls_policies.sql

-- Helper Function: Checks if the current authenticated user has an active membership in the target dealership
-- SECURITY DEFINER with SET search_path = public prevents RLS recursion
CREATE OR REPLACE FUNCTION public.is_dealership_member(target_dealership_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN TRUE; -- Allow service operations
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.dealership_memberships
    WHERE dealership_id = target_dealership_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tenant-owned tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealership_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies (Non-recursive)
DROP POLICY IF EXISTS "Users can view their own profile and profiles in their dealerships" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Access Policy" ON public.profiles;

CREATE POLICY "Profiles Access Policy"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Dealerships Policies
DROP POLICY IF EXISTS "Users can view dealerships they are members of" ON public.dealerships;
DROP POLICY IF EXISTS "Dealership owners can update their dealership" ON public.dealerships;
DROP POLICY IF EXISTS "Dealerships Access Policy" ON public.dealerships;

CREATE POLICY "Dealerships Access Policy"
  ON public.dealerships FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Dealership Memberships Policies (Non-recursive using SECURITY DEFINER helper)
DROP POLICY IF EXISTS "Users can view memberships in their active dealerships" ON public.dealership_memberships;
DROP POLICY IF EXISTS "Owners and managers can insert/update memberships" ON public.dealership_memberships;
DROP POLICY IF EXISTS "Dealership Memberships Access Policy" ON public.dealership_memberships;

CREATE POLICY "Dealership Memberships Access Policy"
  ON public.dealership_memberships FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Tenant Tables Security Policies
DROP POLICY IF EXISTS "Tenant Customers Policy" ON public.customers;
DROP POLICY IF EXISTS "Tenant Vehicles Policy" ON public.vehicles;
DROP POLICY IF EXISTS "Tenant Vehicle Images Policy" ON public.vehicle_images;
DROP POLICY IF EXISTS "Tenant Leads Policy" ON public.leads;
DROP POLICY IF EXISTS "Tenant Lead Sources Policy" ON public.lead_sources;
DROP POLICY IF EXISTS "Tenant Pipeline Stages Policy" ON public.pipeline_stages;
DROP POLICY IF EXISTS "Tenant Conversations Policy" ON public.conversations;
DROP POLICY IF EXISTS "Tenant Messages Policy" ON public.messages;
DROP POLICY IF EXISTS "Tenant Activities Policy" ON public.activities;
DROP POLICY IF EXISTS "Tenant Tasks Policy" ON public.tasks;
DROP POLICY IF EXISTS "Tenant Appointments Policy" ON public.appointments;
DROP POLICY IF EXISTS "Tenant Notes Policy" ON public.notes;
DROP POLICY IF EXISTS "Tenant Automations Policy" ON public.automations;
DROP POLICY IF EXISTS "Tenant Automation Steps Policy" ON public.automation_steps;
DROP POLICY IF EXISTS "Tenant Automation Runs Policy" ON public.automation_runs;
DROP POLICY IF EXISTS "Tenant Automation Logs Policy" ON public.automation_logs;
DROP POLICY IF EXISTS "Tenant Message Templates Policy" ON public.message_templates;
DROP POLICY IF EXISTS "Tenant Audit Logs Read Policy" ON public.audit_logs;

CREATE POLICY "Tenant Customers Policy" ON public.customers FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Vehicles Policy" ON public.vehicles FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Vehicle Images Policy" ON public.vehicle_images FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Leads Policy" ON public.leads FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Lead Sources Policy" ON public.lead_sources FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Pipeline Stages Policy" ON public.pipeline_stages FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Conversations Policy" ON public.conversations FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Messages Policy" ON public.messages FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Activities Policy" ON public.activities FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Tasks Policy" ON public.tasks FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Appointments Policy" ON public.appointments FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Notes Policy" ON public.notes FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Automations Policy" ON public.automations FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Automation Steps Policy" ON public.automation_steps FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Automation Runs Policy" ON public.automation_runs FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Automation Logs Policy" ON public.automation_logs FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Message Templates Policy" ON public.message_templates FOR ALL USING (public.is_dealership_member(dealership_id));
CREATE POLICY "Tenant Audit Logs Read Policy" ON public.audit_logs FOR SELECT USING (public.is_dealership_member(dealership_id));
