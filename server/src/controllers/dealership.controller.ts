import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';
import type { CreateDealershipInput, UpdateDealershipInput } from '../validators/dealership.validator';

async function seedDemoDataForDealership(dealershipId: string, ownerUserId: string) {
  try {
    // 1. Vehicles
    const { data: vehicles } = await supabase.from('vehicles').insert([
      {
        dealership_id: dealershipId,
        year: 2024,
        make: 'Toyota',
        model: 'Camry',
        trim: 'XSE V6',
        vin: '4T1BZ1HK5RU102948',
        stock_number: 'P24-101',
        mileage: 4800,
        price: 34995,
        exterior_color: 'Wind Chill Pearl',
        interior_color: 'Cockpit Red Leather',
        transmission: 'automatic',
        fuel_type: 'gasoline',
        status: 'available',
        description: 'Fully loaded 2024 Camry XSE with panoramic roof and JBL premium audio.',
      },
      {
        dealership_id: dealershipId,
        year: 2023,
        make: 'BMW',
        model: '330i',
        trim: 'xDrive M Sport',
        vin: 'WBA5R7C57PH728192',
        stock_number: 'P23-205',
        mileage: 18400,
        price: 41500,
        exterior_color: 'Portimao Blue Metallic',
        interior_color: 'Black Vernasca Leather',
        transmission: 'automatic',
        fuel_type: 'gasoline',
        status: 'available',
        description: 'Pristine 1-owner BMW 330i xDrive with M Sport package.',
      },
      {
        dealership_id: dealershipId,
        year: 2024,
        make: 'Ford',
        model: 'F-150',
        trim: 'XLT 4x4 SuperCrew',
        vin: '1FTFW1ED4RFB83910',
        stock_number: 'P24-302',
        mileage: 2200,
        price: 52900,
        exterior_color: 'Carbonized Gray',
        interior_color: 'Medium Dark Slate',
        transmission: 'automatic',
        fuel_type: 'gasoline',
        status: 'available',
        description: '2024 F-150 with 3.5L EcoBoost and Max Trailer Tow package.',
      },
    ]).select();

    // 2. Customers
    const { data: customers } = await supabase.from('customers').insert([
      {
        dealership_id: dealershipId,
        first_name: 'John',
        last_name: 'Carter',
        phone: '+1 (555) 301-4492',
        email: 'john.carter@gmail.com',
        location: 'Austin, TX',
        preferred_contact_method: 'sms',
        assigned_user_id: ownerUserId,
        tags: ['financing', 'trade-in', 'website-lead'],
      },
      {
        dealership_id: dealershipId,
        first_name: 'Emily',
        last_name: 'Davis',
        phone: '+1 (555) 482-9912',
        email: 'emily.davis@outlook.com',
        location: 'Round Rock, TX',
        preferred_contact_method: 'email',
        assigned_user_id: ownerUserId,
        tags: ['luxury', 'cash-buyer'],
      },
      {
        dealership_id: dealershipId,
        first_name: 'David',
        last_name: 'Wilson',
        phone: '+1 (555) 771-3320',
        email: 'david.wilson@yahoo.com',
        location: 'Cedar Park, TX',
        preferred_contact_method: 'phone',
        assigned_user_id: ownerUserId,
        tags: ['truck-buyer', 'commercial'],
      },
    ]).select();

    // Fetch pipeline stages and lead sources
    const { data: stages } = await supabase.from('pipeline_stages').select('*').eq('dealership_id', dealershipId).order('sort_order');
    const { data: sources } = await supabase.from('lead_sources').select('*').eq('dealership_id', dealershipId);

    if (customers && customers.length >= 3 && stages && stages.length >= 4) {
      // 3. Leads
      const { data: leads } = await supabase.from('leads').insert([
        {
          dealership_id: dealershipId,
          customer_id: customers[0].id,
          vehicle_id: vehicles && vehicles[0] ? vehicles[0].id : null,
          assigned_user_id: ownerUserId,
          source_id: sources && sources[0] ? sources[0].id : null,
          pipeline_stage_id: stages[2] ? stages[2].id : stages[0].id,
          priority: 'high',
          temperature: 'hot',
          status: 'open',
          estimated_value: 34995,
          notes: 'Submitted online financing inquiry. Looking to trade in 2018 Civic.',
          last_contact_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          next_follow_up_at: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
        },
        {
          dealership_id: dealershipId,
          customer_id: customers[1].id,
          vehicle_id: vehicles && vehicles[1] ? vehicles[1].id : null,
          assigned_user_id: ownerUserId,
          source_id: sources && sources[1] ? sources[1].id : null,
          pipeline_stage_id: stages[3] ? stages[3].id : stages[0].id,
          priority: 'high',
          temperature: 'hot',
          status: 'open',
          estimated_value: 41500,
          notes: 'Confirmed showroom test drive for Saturday at 2:00 PM.',
          last_contact_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          next_follow_up_at: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
        },
        {
          dealership_id: dealershipId,
          customer_id: customers[2].id,
          vehicle_id: vehicles && vehicles[2] ? vehicles[2].id : null,
          assigned_user_id: ownerUserId,
          source_id: sources && sources[2] ? sources[2].id : null,
          pipeline_stage_id: stages[1] ? stages[1].id : stages[0].id,
          priority: 'medium',
          temperature: 'warm',
          status: 'open',
          estimated_value: 52900,
          notes: 'Inquired about towing capacity on F-150. Sent spec sheet.',
          last_contact_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          next_follow_up_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
        },
      ]).select();

      // 4. Tasks & Appointments
      const now = new Date();
      await supabase.from('tasks').insert([
        {
          dealership_id: dealershipId,
          customer_id: customers[0].id,
          lead_id: leads && leads[0] ? leads[0].id : null,
          assigned_user_id: ownerUserId,
          created_by_user_id: ownerUserId,
          title: 'Call John Carter about financing rates',
          description: 'Customer asked about 60mo financing rates with 720 score.',
          type: 'call',
          priority: 'high',
          due_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(),
          status: 'pending',
        },
        {
          dealership_id: dealershipId,
          customer_id: customers[1].id,
          lead_id: leads && leads[1] ? leads[1].id : null,
          assigned_user_id: ownerUserId,
          created_by_user_id: ownerUserId,
          title: 'Prep BMW 330i for test drive',
          description: 'Detail car and print window sticker before 2 PM.',
          type: 'appointment',
          priority: 'medium',
          due_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30).toISOString(),
          status: 'pending',
        },
      ]);

      await supabase.from('appointments').insert([
        {
          dealership_id: dealershipId,
          customer_id: customers[1].id,
          lead_id: leads && leads[1] ? leads[1].id : null,
          vehicle_id: vehicles && vehicles[1] ? vehicles[1].id : null,
          assigned_user_id: ownerUserId,
          type: 'test_drive',
          starts_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(),
          ends_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).toISOString(),
          location: 'Showroom Main Desk',
          notes: 'Customer interested in trade-in valuation for 2019 Audi A4.',
          status: 'confirmed',
        },
      ]);
    }
  } catch (err) {
    console.error('Demo data seed error:', err);
  }
}

// ─── POST /api/v1/dealerships ─────────────────────────────────────────────────

export async function createDealership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as CreateDealershipInput;
    const { address, ...rest } = body;

    const makeSlug = (s: string) =>
      s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let baseSlug = makeSlug(body.name);
    let slug = baseSlug;
    let count = 1;

    while (true) {
      const { data } = await supabase.from('dealerships').select('id').eq('slug', slug).single();
      if (!data) break;
      slug = `${baseSlug}-${count++}`;
    }

    const insertPayload = {
      ...rest,
      slug,
      status: 'active',
      ...(address ? {
        address_line_1: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.zip,
        country: address.country || 'US',
      } : {}),
    };

    const { data: dealership, error: dealError } = await supabase
      .from('dealerships')
      .insert(insertPayload)
      .select()
      .single();

    if (dealError || !dealership) {
      throw new Error(`Failed to create dealership: ${dealError?.message}`);
    }

    // Creator becomes owner
    await supabase.from('dealership_memberships').insert({
      dealership_id: dealership.id,
      user_id: req.user.id,
      role: 'owner',
      permissions: [],
      status: 'active',
    });

    // Seed default pipeline stages
    const defaultStages = [
      { name: 'New', slug: 'new', color: '#2563EB', sort_order: 0, type: 'standard', is_system: false },
      { name: 'Contacted', slug: 'contacted', color: '#7C3AED', sort_order: 1, type: 'standard', is_system: false },
      { name: 'Follow-Up', slug: 'follow-up', color: '#F59E0B', sort_order: 2, type: 'standard', is_system: false },
      { name: 'Appointment', slug: 'appointment', color: '#0891B2', sort_order: 3, type: 'standard', is_system: false },
      { name: 'Negotiation', slug: 'negotiation', color: '#EA580C', sort_order: 4, type: 'standard', is_system: false },
      { name: 'Sold', slug: 'sold', color: '#16A34A', sort_order: 5, type: 'won', is_system: true },
      { name: 'Lost', slug: 'lost', color: '#DC2626', sort_order: 6, type: 'lost', is_system: true },
    ];

    await supabase.from('pipeline_stages').insert(
      defaultStages.map((s) => ({ ...s, dealership_id: dealership.id }))
    );

    // Seed default lead sources
    const defaultSources = [
      { name: 'Website', channel: 'web', is_active: true },
      { name: 'Phone Call', channel: 'phone', is_active: true },
      { name: 'Walk-In', channel: 'walk-in', is_active: true },
      { name: 'Referral', channel: 'referral', is_active: true },
      { name: 'Facebook', channel: 'social', is_active: true },
    ];

    await supabase.from('lead_sources').insert(
      defaultSources.map((s) => ({ ...s, dealership_id: dealership.id }))
    );

    // Seed rich demo data (vehicles, customers, leads, tasks, appointments)
    await seedDemoDataForDealership(dealership.id, req.user.id);

    sendSuccess(res, {
      statusCode: 201,
      message: 'Dealership created with demo data',
      data: { dealership },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/dealerships/mine ────────────────────────────────────────────

export async function getMyDealerships(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data: memberships } = await supabase
      .from('dealership_memberships')
      .select('*, dealership:dealerships(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'active');

    sendSuccess(res, { data: memberships || [] });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/dealerships/:id ─────────────────────────────────────────────

export async function getDealership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    sendSuccess(res, { data: { dealership: req.dealership } });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/v1/dealerships/:id ───────────────────────────────────────────

export async function updateDealership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as UpdateDealershipInput;
    const { address, ...rest } = body;
    const { data: dealership, error } = await supabase
      .from('dealerships')
      .update({
        ...rest,
        ...(address ? {
          address_line_1: address.street,
          city: address.city,
          state: address.state,
          postal_code: address.zip,
          country: address.country || 'US',
        } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.tenant.dealershipId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    sendSuccess(res, { message: 'Dealership updated', data: { dealership } });
  } catch (err) {
    next(err);
  }
}
