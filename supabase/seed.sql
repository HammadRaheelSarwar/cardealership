-- Supabase Seed Data (Demo / Local Dev Only)
-- File: supabase/seed.sql

-- Demo Dealership
INSERT INTO public.dealerships (id, name, slug, email, phone, website, timezone, status, financial_tracking_enabled)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Premier Automotive Group',
  'premier-auto',
  'contact@premierautogroup.com',
  '+15550192834',
  'https://premierautogroup.com',
  'America/New_York',
  'active',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Demo Pipeline Stages (6 Core Stages + Lost)
DELETE FROM public.pipeline_stages WHERE dealership_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
INSERT INTO public.pipeline_stages (id, dealership_id, name, slug, color, sort_order, type, is_system)
VALUES
  ('c1b2c3d4-e5f6-7890-abcd-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'New Lead', 'new-lead', '#3B82F6', 0, 'standard', false),
  ('c1b2c3d4-e5f6-7890-abcd-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Contacted', 'contacted', '#8B5CF6', 1, 'standard', false),
  ('c1b2c3d4-e5f6-7890-abcd-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Appointment Set', 'appointment-set', '#06B6D4', 2, 'standard', false),
  ('c1b2c3d4-e5f6-7890-abcd-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Show / Test Drive', 'show-test-drive', '#D4AF37', 3, 'standard', false),
  ('c1b2c3d4-e5f6-7890-abcd-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Working Deal', 'working-deal', '#F97316', 4, 'standard', false),
  ('c1b2c3d4-e5f6-7890-abcd-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sold', 'sold', '#22C55E', 5, 'won', true),
  ('c1b2c3d4-e5f6-7890-abcd-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Lost', 'lost', '#DC2626', 6, 'lost', true)
ON CONFLICT DO NOTHING;

-- Demo Profiles
INSERT INTO public.profiles (id, first_name, last_name, email, platform_role, status, email_verified)
VALUES
  ('d1b2c3d4-e5f6-7890-abcd-000000000001', 'Alex', 'Morgan', 'alex@premierautogroup.com', 'user', 'active', true),
  ('d1b2c3d4-e5f6-7890-abcd-000000000002', 'Shane', 'Miller', 'shane@premierautogroup.com', 'user', 'active', true),
  ('d1b2c3d4-e5f6-7890-abcd-000000000003', 'Sarah', 'Parker', 'sarah@premierautogroup.com', 'user', 'active', true),
  ('d1b2c3d4-e5f6-7890-abcd-000000000004', 'Michael', 'Brown', 'michael@premierautogroup.com', 'user', 'active', true),
  ('d1b2c3d4-e5f6-7890-abcd-000000000005', 'James', 'Wilson', 'james@premierautogroup.com', 'user', 'active', true),
  ('d1b2c3d4-e5f6-7890-abcd-000000000006', 'Marcus', 'Hayes', 'marcus@premierautogroup.com', 'user', 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Demo Dealership Memberships
INSERT INTO public.dealership_memberships (dealership_id, user_id, role, permissions, status)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000001', 'owner', '["*"]'::jsonb, 'active'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000002', 'manager', '["team.*"]'::jsonb, 'active'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000003', 'salesperson', '["leads.own", "tasks.own"]'::jsonb, 'active'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000004', 'salesperson', '["leads.own", "tasks.own"]'::jsonb, 'active'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000005', 'salesperson', '["leads.own", "tasks.own"]'::jsonb, 'active'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000006', 'manager', '["team.*"]'::jsonb, 'active')
ON CONFLICT (dealership_id, user_id) DO NOTHING;

-- Demo Manager Team Relationships (Shane Miller manages Sarah, Michael, James)
INSERT INTO public.manager_team_members (dealership_id, manager_user_id, salesperson_user_id)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000002', 'd1b2c3d4-e5f6-7890-abcd-000000000003'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000002', 'd1b2c3d4-e5f6-7890-abcd-000000000004'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd1b2c3d4-e5f6-7890-abcd-000000000002', 'd1b2c3d4-e5f6-7890-abcd-000000000005')
ON CONFLICT DO NOTHING;

-- Demo Lead Sources
INSERT INTO public.lead_sources (id, dealership_id, name, channel)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Website Form', 'web'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AutoTrader', 'marketplace'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Phone Call', 'phone'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Walk-In', 'walk-in')
ON CONFLICT DO NOTHING;
