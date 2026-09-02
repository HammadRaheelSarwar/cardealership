import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load from current working directory and fallback to server directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  // Supabase Database & Auth
  SUPABASE_URL: z.string().min(1).default('https://example.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default('ey...service_role_key'),
  SUPABASE_ANON_KEY: z.string().optional(),

  // Auth
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default('dealership_crm_dev_access_secret_32_characters_minimum'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default('dealership_crm_dev_refresh_secret_32_characters_minimum'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_DOMAIN: z.string().optional(),

  // Redis
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  // AI
  AI_PROVIDER: z.enum(['openai']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o'),

  // SMS
  SMS_PROVIDER: z.enum(['twilio']).default('twilio'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z.enum(['resend', 'sendgrid', 'postmark']).default('resend'),
  RESEND_API_KEY: z.string().optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(['supabase', 'cloudinary', 's3']).default('supabase'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Security
  ENCRYPTION_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
