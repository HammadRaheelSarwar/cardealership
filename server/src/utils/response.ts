import { Response } from 'express';

interface SuccessOptions {
  message?: string;
  data?: unknown;
  meta?: unknown;
  statusCode?: number;
}

interface ErrorOptions {
  message: string;
  errors?: unknown;
  statusCode?: number;
}

export function sendSuccess(res: Response, options: SuccessOptions = {}): Response {
  const { message = 'Success', data, meta, statusCode = 200 } = options;
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? { meta } : {}),
  });
}

export function sendError(res: Response, options: ErrorOptions): Response {
  const { message, errors, statusCode = 500 } = options;
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number }
): Response {
  const { page, limit, total } = pagination;
  return res.status(200).json({
    success: true,
    message: 'Success',
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
