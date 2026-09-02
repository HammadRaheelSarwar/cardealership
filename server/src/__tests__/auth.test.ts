import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  generateEmailVerificationToken,
} from '../services/auth.service';

describe('Authentication & Token Service', () => {
  it('should hash and compare passwords correctly', async () => {
    const plain = 'SecretPassword123!';
    const hash = await hashPassword(plain);
    expect(hash).not.toEqual(plain);

    const valid = await comparePassword(plain, hash);
    expect(valid).toBe(true);

    const invalid = await comparePassword('WrongPassword', hash);
    expect(invalid).toBe(false);
  });

  it('should generate valid JWT access tokens', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const token = generateAccessToken(userId);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
  });

  it('should rotate a refresh token for the same user', async () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const refreshToken = await generateRefreshToken(userId);
    const rotated = await rotateRefreshToken(refreshToken);
    const accessPayload = jwt.verify(rotated.accessToken, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    const refreshPayload = jwt.verify(rotated.newRefreshToken, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;

    expect(accessPayload.userId).toBe(userId);
    expect(refreshPayload.userId).toBe(userId);
    expect(refreshPayload.type).toBe('refresh');
  });

  it('should reject an invalid refresh token', async () => {
    await expect(rotateRefreshToken('not-a-valid-token')).rejects.toThrow(
      'Invalid or expired refresh token'
    );
  });

  it('should generate verification tokens', () => {
    const token = generateEmailVerificationToken();
    expect(token).toBeDefined();
    expect(token.length).toBe(64);
  });
});
