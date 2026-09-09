import { env } from '../config/env';
import { Router } from 'express';
import { authenticate, resolveTenant, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
const router = Router();
router.use(authenticate, resolveTenant, requireRole('owner', 'manager'));
router.get('/', async (req, res, next) => {
  try {
    let query = supabase
      .from('dealership_memberships')
      .select('*, profile:profiles(*)')
      .eq('dealership_id', req.tenant.dealershipId);
    if (req.tenant.role === 'manager') {
      const team = await supabase
        .from('manager_team_members')
        .select('salesperson_user_id')
        .eq('dealership_id', req.tenant.dealershipId)
        .eq('manager_user_id', req.user.id);
      if (team.error) throw new AppError('Unable to load team', 503);
      query = query.in('user_id', [
        req.user.id,
        ...(team.data || []).map((t) => t.salesperson_user_id),
      ]);
    }
    const { data, error } = await query.order('created_at');
    if (error) throw new AppError(error.message, 503);
    sendSuccess(res, { data: data || [] });
  } catch (e) {
    next(e);
  }
});
router.post('/', requireRole('owner'), async (req, res, next) => {
  try {
    const { email, firstName, lastName, role } = req.body;
    if (
      !email ||
      !firstName ||
      !lastName ||
      !['salesperson', 'manager'].includes(role)
    )
      throw new AppError('Name, email and valid role are required', 400);
    const existing = await supabase
      .from('profiles')
      .select('*')
      .eq('email', String(email).toLowerCase())
      .maybeSingle();
    if (existing.error) throw new AppError(existing.error.message, 503);
    let profile = existing.data;
    if (!profile) {
      const invite = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { first_name: firstName, last_name: lastName },
        redirectTo: `${env.CLIENT_URL}/reset-password`,
      });
      if (invite.error || !invite.data.user)
        throw new AppError(
          invite.error?.message || 'Unable to invite user',
          400
        );
      const created = await supabase
        .from('profiles')
        .insert({
          id: invite.data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          status: 'active',
        })
        .select()
        .single();
      if (created.error) throw new AppError(created.error.message, 503);
      profile = created.data;
    }
    const result = await supabase
      .from('dealership_memberships')
      .insert({
        dealership_id: req.tenant.dealershipId,
        user_id: profile.id,
        role,
        status: 'active',
      })
      .select()
      .single();
    if (result.error) throw new AppError(result.error.message, 400);
    sendSuccess(res, { statusCode: 201, data: result.data });
  } catch (e) {
    next(e);
  }
});
router.post('/assign', requireRole('owner'), async (req, res, next) => {
  try {
    const { managerId, salespersonId } = req.body;
    const members = await supabase
      .from('dealership_memberships')
      .select('user_id,role')
      .eq('dealership_id', req.tenant.dealershipId)
      .eq('status', 'active')
      .in('user_id', [managerId, salespersonId]);
    if (
      members.error ||
      !members.data?.some(
        (m) => m.user_id === managerId && m.role === 'manager'
      ) ||
      !members.data?.some(
        (m) => m.user_id === salespersonId && m.role === 'salesperson'
      )
    )
      throw new AppError(
        'Select an active manager and salesperson from this dealership',
        400
      );
    const result = await supabase
      .from('manager_team_members')
      .upsert(
        {
          dealership_id: req.tenant.dealershipId,
          manager_user_id: managerId,
          salesperson_user_id: salespersonId,
        },
        { onConflict: 'dealership_id,manager_user_id,salesperson_user_id' }
      );
    if (result.error) throw new AppError(result.error.message, 400);
    sendSuccess(res);
  } catch (e) {
    next(e);
  }
});
export default router;
