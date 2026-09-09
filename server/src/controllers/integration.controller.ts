import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { sendSuccess } from '../utils/response';

export async function getIntegrationStatus(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const smsConfigured = Boolean(
      env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER
    );
    const emailConfigured = Boolean(
      env.RESEND_API_KEY && env.EMAIL_FROM_ADDRESS
    );
    const aiConfigured = Boolean(env.OPENAI_API_KEY);
    const storageConfigured = Boolean(
      env.SUPABASE_URL && !env.SUPABASE_URL.includes('example.supabase')
    );

    sendSuccess(res, {
      data: {
        sms: {
          provider: 'twilio',
          configured: smsConfigured,
        },
        email: {
          provider: 'resend',
          configured: emailConfigured,
        },
        ai: {
          provider: 'openai',
          configured: aiConfigured,
        },
        storage: {
          provider: 'supabase',
          configured: storageConfigured,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
