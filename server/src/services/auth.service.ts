import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const BCRYPT_ROUNDS = 12;

// ─── Token Generation ─────────────────────────────────────────────────────────

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function generateRefreshToken(
  userId: string,
  _ipAddress?: string,
  _userAgent?: string
): Promise<string> {
  return jwt.sign(
    { userId, type: 'refresh', nonce: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

// ─── Token Cookie Config ──────────────────────────────────────────────────────

export function getRefreshTokenCookieOptions() {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    ...(isProduction && env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

// ─── Password Utilities ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── Refresh Token Rotation ───────────────────────────────────────────────────

export async function rotateRefreshToken(
  rawToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; newRefreshToken: string }> {
  let payload: jwt.JwtPayload;

  try {
    payload = jwt.verify(rawToken, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (payload.type !== 'refresh' || typeof payload.userId !== 'string') {
    throw new AppError('Invalid refresh token', 401);
  }

  const newRefreshToken = await generateRefreshToken(payload.userId, ipAddress, userAgent);
  return {
    accessToken: generateAccessToken(payload.userId),
    newRefreshToken,
  };
}

// ─── Token Verification Helpers ───────────────────────────────────────────────

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
