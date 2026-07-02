import { BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export function validateQuery<T>(
  schema: ZodSchema<T>,
  query: Record<string, unknown>
): T {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw new BadRequestException({
      message: 'Query validation failed',
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    });
  }
  return result.data;
}

export function validateParams<T>(
  schema: ZodSchema<T>,
  params: Record<string, unknown>
): T {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new BadRequestException({
      message: 'Parameter validation failed',
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    });
  }
  return result.data;
}
