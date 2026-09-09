import { Request, Response, NextFunction } from 'express';
import { supabase, createAuthClient } from '../config/supabase';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions,
  rotateRefreshToken,
} from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { env } from '../config/env';
const REFRESH_COOKIE = 'refreshToken';

async function membershipsFor(userId: string) {
  const { data, error } = await supabase
    .from('dealership_memberships')
    .select('*, dealership:dealerships(*)')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) throw new AppError('Unable to load dealership memberships', 503);
  return data || [];
}
async function session(
  req: Request,
  res: Response,
  user: any,
  statusCode = 200
) {
  const memberships = await membershipsFor(user.id);
  const accessToken = generateAccessToken(user.id);
  res.cookie(
    REFRESH_COOKIE,
    await generateRefreshToken(user.id, req.ip, req.headers['user-agent']),
    getRefreshTokenCookieOptions()
  );
  sendSuccess(res, { statusCode, data: { user, accessToken, memberships } });
}
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const existing = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existing.error) throw new AppError('Unable to check account', 503);
    if (existing.data)
      throw new AppError('An account with this email already exists', 409);
    const { data, error } = await createAuthClient().auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${env.CLIENT_URL}/login`,
      },
    });
    if (error || !data.user)
      throw new AppError(error?.message || 'Unable to create account', 400);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        platform_role: 'user',
        status: 'active',
        email_verified: false,
      })
      .select()
      .single();
    if (profileError || !profile) {
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new AppError(
        'Unable to save account profile. Please try again.',
        503
      );
    }
    await session(req, res, profile, 201);
  } catch (error) {
    next(error);
  }
}
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await createAuthClient().auth.signInWithPassword({
      email: req.body.email,
      password: req.body.password,
    });
    if (error || !data.user)
      throw new AppError(
        'Invalid email or password, or email confirmation required',
        401
      );
    const { data: user, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || !user)
      throw new AppError('Account profile not found', 403);
    if (user.status !== 'active')
      throw new AppError('Account is not active', 403);
    await session(req, res, user);
  } catch (error) {
    next(error);
  }
}
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.cookies[REFRESH_COOKIE])
      throw new AppError('Refresh token required', 401);
    const { accessToken, newRefreshToken } = await rotateRefreshToken(
      req.cookies[REFRESH_COOKIE]
    );
    res.cookie(REFRESH_COOKIE, newRefreshToken, getRefreshTokenCookieOptions());
    sendSuccess(res, { data: { accessToken } });
  } catch (error) {
    next(error);
  }
}
export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.clearCookie(REFRESH_COOKIE, getRefreshTokenCookieOptions());
    sendSuccess(res);
  } catch (error) {
    next(error);
  }
}
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    sendSuccess(res, {
      data: { user: req.user, memberships: await membershipsFor(req.user.id) },
    });
  } catch (error) {
    next(error);
  }
}
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { error } = await createAuthClient().auth.resetPasswordForEmail(
      req.body.email,
      { redirectTo: `${env.CLIENT_URL}/reset-password` }
    );
    if (error) throw new AppError('Unable to request a password reset', 503);
    sendSuccess(res, {
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
}
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase.auth.getUser(req.body.token);
    if (error || !data.user)
      throw new AppError('Invalid or expired reset link', 401);
    const result = await supabase.auth.admin.updateUserById(data.user.id, {
      password: req.body.password,
    });
    if (result.error) throw new AppError('Unable to update password', 400);
    sendSuccess(res, { message: 'Password updated. Please log in.' });
  } catch (error) {
    next(error);
  }
}
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await createAuthClient().auth.verifyOtp({
      token_hash: req.body.token,
      type: 'email',
    });
    if (error || !data.user)
      throw new AppError('Invalid or expired verification link', 400);
    const result = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', data.user.id);
    if (result.error)
      throw new AppError('Unable to update verification status', 503);
    sendSuccess(res, { message: 'Email verified' });
  } catch (error) {
    next(error);
  }
}
