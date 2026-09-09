-- Supabase Migration: Role-Based CRM Extensions
-- Migration: 20260902000003_role_based_crm.sql

-- 1. Dealership Financial Tracking Flag
ALTER TABLE public.dealerships 
ADD COLUMN IF NOT EXISTS financial_tracking_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Tasks Table Extensions (Outcome tracking & Completing User)
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS outcome TEXT,
ADD COLUMN IF NOT EXISTS completed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Manager Team Members Table (Relational scoping between manager and salespeople)
CREATE TABLE IF NOT EXISTS public.manager_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  manager_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salesperson_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_manager_salesperson UNIQUE (dealership_id, manager_user_id, salesperson_user_id)
);

CREATE INDEX IF NOT EXISTS idx_mtm_dealership_manager ON public.manager_team_members(dealership_id, manager_user_id);
CREATE INDEX IF NOT EXISTS idx_mtm_dealership_salesperson ON public.manager_team_members(dealership_id, salesperson_user_id);

-- 4. Lead Stage History Table (For pipeline conversion, drop-off analysis, and time in stage)
CREATE TABLE IF NOT EXISTS public.lead_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lsh_dealership_lead ON public.lead_stage_history(dealership_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_lsh_dealership_stages ON public.lead_stage_history(dealership_id, from_stage_id, to_stage_id);

-- 5. Sales Records Table (For closed deals, volume, gross, and net profit reporting)
CREATE TABLE IF NOT EXISTS public.sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  salesperson_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sale_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  gross_profit NUMERIC(12, 2),
  net_profit NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sr_dealership_date ON public.sales_records(dealership_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sr_dealership_salesperson ON public.sales_records(dealership_id, salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sr_dealership_manager ON public.sales_records(dealership_id, manager_id);

-- 6. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.manager_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- 7. Policies for Tenant Scoping
DROP POLICY IF EXISTS "Tenant Manager Team Members Policy" ON public.manager_team_members;
CREATE POLICY "Tenant Manager Team Members Policy" 
ON public.manager_team_members FOR ALL 
USING (public.is_dealership_member(dealership_id));

DROP POLICY IF EXISTS "Tenant Lead Stage History Policy" ON public.lead_stage_history;
CREATE POLICY "Tenant Lead Stage History Policy" 
ON public.lead_stage_history FOR ALL 
USING (public.is_dealership_member(dealership_id));

DROP POLICY IF EXISTS "Tenant Sales Records Policy" ON public.sales_records;
CREATE POLICY "Tenant Sales Records Policy" 
ON public.sales_records FOR ALL 
USING (public.is_dealership_member(dealership_id));

-- 8. Seed/Update Core Default Pipeline Stages
-- Ensure the standard 6 stages exist for demo dealership
DO $$
DECLARE
  v_dealership_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
  IF EXISTS (SELECT 1 FROM public.dealerships WHERE id = v_dealership_id) THEN
    -- Upsert or insert standard stages
    INSERT INTO public.pipeline_stages (dealership_id, name, slug, color, sort_order, type, is_system)
    VALUES
      (v_dealership_id, 'New Lead', 'new-lead', '#3B82F6', 0, 'standard', false),
      (v_dealership_id, 'Contacted', 'contacted', '#8B5CF6', 1, 'standard', false),
      (v_dealership_id, 'Appointment Set', 'appointment-set', '#06B6D4', 2, 'standard', false),
      (v_dealership_id, 'Show / Test Drive', 'show-test-drive', '#D4AF37', 3, 'standard', false),
      (v_dealership_id, 'Working Deal', 'working-deal', '#F97316', 4, 'standard', false),
      (v_dealership_id, 'Sold', 'sold', '#22C55E', 5, 'won', true),
      (v_dealership_id, 'Lost', 'lost', '#DC2626', 6, 'lost', true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
