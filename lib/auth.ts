import crypto from 'crypto';
import { env } from '@/env';
import { logger } from '@/lib/logger';

const MIN_SECRET_LENGTH = 32;

/**
 * Validates CRON secret using timing-safe comparison to prevent timing attacks.
 * @param authHeader - The Authorization header value
 * @returns true if the secret is valid, false otherwise
 */
export function validateCronSecret(authHeader: string | null): boolean {
  if (!authHeader || !env.CRON_SECRET) {
    return false;
  }

  // Warn if secret is too short (security risk)
  if (env.CRON_SECRET.length < MIN_SECRET_LENGTH) {
    logger.warn(`CRON_SECRET is shorter than ${MIN_SECRET_LENGTH} characters - this is a security risk`);
  }

  const expected = `Bearer ${env.CRON_SECRET}`;

  // Ensure both strings have the same length for timingSafeEqual
  if (authHeader.length !== expected.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(authHeader, 'utf8'),
      Buffer.from(expected, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Returns an unauthorized response for CRON endpoints.
 */
export function unauthorizedResponse(): Response {
  return new Response('Unauthorized', { status: 401 });
}
