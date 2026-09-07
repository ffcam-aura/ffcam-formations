import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';

vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
  setContext: vi.fn(),
}));

// Le logger se tait quand NODE_ENV vaut 'test' et lit la variable au chargement :
// on le réimporte avec un environnement de production pour observer les envois.
async function loadProductionLogger() {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', 'production');
  return (await import('./logger')).logger;
}

describe('logger', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it('joint le contexte de warn à la capture elle-même', async () => {
    const logger = await loadProductionLogger();
    const data = { bytes: 1_600_000, formations: 1432 };

    logger.warn('Limite approchée', data);

    expect(Sentry.captureMessage).toHaveBeenCalledWith('Limite approchée', {
      level: 'warning',
      extra: data,
    });
    // Posé après coup, le contexte manquerait à cet événement et fuiterait sur les suivants.
    expect(Sentry.setContext).not.toHaveBeenCalled();
  });

  it('joint le contexte de error à la capture quand ce n\'est pas une Error', async () => {
    const logger = await loadProductionLogger();
    const context = { formations: 1432 };

    logger.error('Échec', 'pas une Error', context);

    expect(Sentry.captureMessage).toHaveBeenCalledWith('Échec', {
      level: 'error',
      extra: context,
    });
    expect(Sentry.setContext).not.toHaveBeenCalled();
  });

  it('passe par captureException avec le contexte pour une vraie Error', async () => {
    const logger = await loadProductionLogger();
    const error = new Error('boum');

    logger.error('Échec', error, { formations: 1432 });

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { message: 'Échec' },
      extra: { formations: 1432 },
    });
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });
});
