import * as Sentry from '@sentry/nextjs';

/**
 * Logger simple et efficace
 * - En test : silencieux
 * - En dev : console.log/warn/error
 * - En prod : envoi à Sentry
 */

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export const logger = {
  info: (message: string, data?: unknown) => {
    if (isTest) return;
    if (isDev) {
      console.log(message, data);
    }
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data
    });
  },

  error: (message: string, error?: unknown, context?: unknown) => {
    if (isTest) return;

    if (isDev) {
      console.error(message, error, context);
    }

    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { message },
        extra: context
      });
    } else {
      Sentry.captureMessage(message, 'error');
      if (context) {
        Sentry.setContext('error_context', context);
      }
    }
  },

  warn: (message: string, data?: unknown) => {
    if (isTest) return;

    if (isDev) {
      console.warn(message, data);
    }

    Sentry.captureMessage(message, 'warning');
    if (data) {
      Sentry.setContext('warning_context', data);
    }
  },

  debug: (message: string, data?: unknown) => {
    if (isTest) return;
    if (isDev) {
      console.debug(message, data);
    }
    // Les logs debug ne sont pas envoyés à Sentry
  }
};