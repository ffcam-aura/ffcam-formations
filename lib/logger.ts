import * as Sentry from '@sentry/nextjs';
import { sanitizeLogContext } from '@/lib/logSanitizer';

/**
 * Logger simple et efficace
 * - En test : silencieux
 * - En dev : console.log/warn/error
 * - En prod : envoi à Sentry
 */

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

type LogContext = Record<string, unknown>;

export const logger = {
  info: (message: string, data?: LogContext) => {
    if (isTest) return;
    if (isDev) {
      console.log(message, data);
    }
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: sanitizeLogContext(data) as Record<string, string | number | boolean>
    });
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (isTest) return;

    if (isDev) {
      console.error(message, error, context);
    }

    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { message },
        extra: sanitizeLogContext(context) as Record<string, unknown>
      });
    } else {
      // Le contexte doit être passé à la capture : posé après, il manquerait à
      // cet événement et resterait sur le scope pour polluer les suivants.
      Sentry.captureMessage(message, { level: 'error', extra: sanitizeLogContext(context) });
    }
  },

  warn: (message: string, data?: LogContext) => {
    if (isTest) return;

    if (isDev) {
      console.warn(message, data);
    }

    Sentry.captureMessage(message, { level: 'warning', extra: sanitizeLogContext(data) });
  },

  debug: (message: string, data?: LogContext) => {
    if (isTest) return;
    if (isDev) {
      console.debug(message, data);
    }
    // Les logs debug ne sont pas envoyés à Sentry
  }
};