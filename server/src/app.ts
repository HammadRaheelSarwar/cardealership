import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import apiRouter from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
// credentials: true is required for httpOnly cookie delivery
// Origin is restricted to the approved frontend URL only

app.use(
  cors({
    origin: [env.CLIENT_URL, ...(env.NODE_ENV === 'development' ? ['http://localhost:5173'] : [])],
    credentials: true, // Required for httpOnly refresh token cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Dealership-Id', // tenant context header
    ],
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ─── HTTP Logging ─────────────────────────────────────────────────────────────

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Trust Proxy (for Render/Railway/Vercel deployments) ─────────────────────

app.set('trust proxy', 1);

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1', apiRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use(notFoundHandler);

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

import { initSocket, getIO } from './socket';

// ─── Startup ─────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  initSocket(server);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { disconnectDatabase } = await import('./config/database');
      const { disconnectRedis } = await import('./config/redis');
      await disconnectDatabase();
      await disconnectRedis();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });
}

start();

export { app, getIO };
