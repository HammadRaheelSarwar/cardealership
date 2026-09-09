import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';
import type {
  CreateDealershipInput,
  UpdateDealershipInput,
} from '../validators/dealership.validator';

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
      s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    let baseSlug = makeSlug(body.name);
    let slug = baseSlug;
    let count = 1;

    while (true) {
      const { data } = await supabase
        .from('dealerships')
        .select('id')
        .eq('slug', slug)
        .single();
      if (!data) break;
      slug = `${baseSlug}-${count++}`;
    }

    const insertPayload = {
      ...rest,
      slug,
      status: 'active',
      ...(address
        ? {
            address_line_1: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.zip,
            country: address.country || 'US',
          }
        : {}),
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
      {
        name: 'New',
        slug: 'new',
        color: '#2563EB',
        sort_order: 0,
        type: 'standard',
        is_system: false,
      },
      {
        name: 'Contacted',
        slug: 'contacted',
        color: '#7C3AED',
        sort_order: 1,
        type: 'standard',
        is_system: false,
      },
      {
        name: 'Follow-Up',
        slug: 'follow-up',
        color: '#F59E0B',
        sort_order: 2,
        type: 'standard',
        is_system: false,
      },
      {
        name: 'Appointment',
        slug: 'appointment',
        color: '#0891B2',
        sort_order: 3,
        type: 'standard',
        is_system: false,
      },
      {
        name: 'Negotiation',
        slug: 'negotiation',
        color: '#EA580C',
        sort_order: 4,
        type: 'standard',
        is_system: false,
      },
      {
        name: 'Sold',
        slug: 'sold',
        color: '#16A34A',
        sort_order: 5,
        type: 'won',
        is_system: true,
      },
      {
        name: 'Lost',
        slug: 'lost',
        color: '#DC2626',
        sort_order: 6,
        type: 'lost',
        is_system: true,
      },
    ];

    await supabase
      .from('pipeline_stages')
      .insert(
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

    await supabase
      .from('lead_sources')
      .insert(
        defaultSources.map((s) => ({ ...s, dealership_id: dealership.id }))
      );

    sendSuccess(res, {
      statusCode: 201,
      message: 'Dealership created',
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
        ...(address
          ? {
              address_line_1: address.street,
              city: address.city,
              state: address.state,
              postal_code: address.zip,
              country: address.country || 'US',
            }
          : {}),
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
