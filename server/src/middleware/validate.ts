import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware — validates req[target] against the provided schema.
 * On failure returns a structured 422 with descriptive per-field errors.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      const details = Object.entries(formatted)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join('; ');
      next(new AppError(`Validation failed: ${details}`, 422, formatted));
      return;
    }

    // Replace with parsed (coerced, trimmed) data
    req[target] = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }
  return errors;
}
