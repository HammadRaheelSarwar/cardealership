-- Supabase Seed Data (Demo / Local Dev Only)
-- File: supabase/seed.sql

-- Demo Dealership
INSERT INTO public.dealerships (id, name, slug, email, phone, website, timezone, status)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Premier Automotive Group',
  'premier-auto',
  'contact@premierautogroup.com',
  '+15550192834',
  'https://premierautogroup.com',
  'America/New_York',
  'active'
) ON CONFLICT (slug) DO NOTHING;

-- Demo Pipeline Stages
INSERT INTO public.pipeline_stages (id, dealership_id, name, slug, color, sort_order, type, is_system)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'New', 'new', '#2563EB', 0, 'standard', false),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Contacted', 'contacted', '#7C3AED', 1, 'standard', false),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Follow-Up', 'follow-up', '#F59E0B', 2, 'standard', false),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Appointment', 'appointment', '#0891B2', 3, 'standard', false),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Negotiation', 'negotiation', '#EA580C', 4, 'standard', false),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sold', 'sold', '#16A34A', 5, 'won', true),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Lost', 'lost', '#DC2626', 6, 'lost', true);

-- Demo Lead Sources
INSERT INTO public.lead_sources (id, dealership_id, name, channel)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Website Form', 'web'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AutoTrader', 'marketplace'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Phone Call', 'phone'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Walk-In', 'walk-in');
