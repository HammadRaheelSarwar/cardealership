import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import type { Profile, DealershipMembership, Dealership, DealershipRole } from '../types/database';

// ─── Tenant Context ───────────────────────────────────────────────────────────

export interface TenantContext {
  dealershipId: string;
  membershipId: string;
  role: DealershipRole;
  permissions: string[];
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user: Profile;
      tenant: TenantContext;
      membership: DealershipMembership;
      dealership: Dealership;
    }
  }
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

// ─── 1. authenticate ──────────────────────────────────────────────────────────
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired access token', 401);
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (error || !user) throw new AppError('User profile not found', 401);
    if (user.status === 'suspended') throw new AppError('Account suspended', 403);

    req.user = user as Profile;
    next();
  } catch (err) {
    next(err);
  }
}

// ─── 2. resolveTenant ─────────────────────────────────────────────────────────
export async function resolveTenant(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dealershipId = req.headers['x-dealership-id'] as string;

    if (!dealershipId) {
      throw new AppError('Dealership context required', 400);
    }

    // Resolve membership from Supabase PostgreSQL — active status check
    const { data: membership, error: memError } = await supabase
      .from('dealership_memberships')
      .select('*, dealership:dealerships(*)')
      .eq('dealership_id', dealershipId)
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (memError || !membership) {
      throw new AppError('Access to this dealership is not permitted', 403);
    }

    const dealership = membership.dealership as Dealership;
    if (!dealership) throw new AppError('Dealership not found', 404);
    if (dealership.status === 'suspended') {
      throw new AppError('Dealership account is suspended', 403);
    }

    req.membership = membership as DealershipMembership;
    req.dealership = dealership;
    req.tenant = {
      dealershipId: membership.dealership_id,
      membershipId: membership.id,
      role: membership.role as DealershipRole,
      permissions: membership.permissions || [],
    };

    next();
  } catch (err) {
    next(err);
  }
}

// ─── 3. requireRole ───────────────────────────────────────────────────────────
export function requireRole(...roles: DealershipRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!roles.includes(req.tenant.role)) {
      next(new AppError('Insufficient role for this action', 403));
      return;
    }
    next();
  };
}

// ─── 4. requireSuperAdmin ─────────────────────────────────────────────────────
export function requireSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.user.platform_role !== 'super_admin') {
    next(new AppError('Super admin access required', 403));
    return;
  }
  next();
}

// ─── 5. requirePermission ─────────────────────────────────────────────────────
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { role, permissions } = req.tenant;

    if (role === 'owner') {
      next();
      return;
    }

    if (!permissions.includes(permission)) {
      next(new AppError(`Permission required: ${permission}`, 403));
      return;
    }
    next();
  };
}

// ─── 6. optionalAuth ─────────────────────────────────────────────────────────
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }
    await authenticate(req, _res, next);
  } catch {
    next();
  }
}
