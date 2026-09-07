import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';
import { makeFormation } from '@/test/factories';

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const getAllFormations = vi.fn();
vi.mock('@/services/formation/formations.service', () => ({
  FormationService: vi.fn(() => ({ getAllFormations })),
}));
vi.mock('@/repositories/FormationRepository', () => ({ FormationRepository: vi.fn() }));

// unstable_cache est un passe-plat ici : on teste le callback, pas le cache de Next.
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

/** Assez de formations pour franchir un seuil d'octets donné. */
function formationsPesant(octets: number) {
  const unit = Buffer.byteLength(JSON.stringify(makeFormation()));
  return Array.from({ length: Math.ceil(octets / unit) + 1 }, (_, i) =>
    makeFormation({ reference: `REF-${i}` })
  );
}

describe('garde-fou de taille du cache', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('./cachedFormations');
    mod.__resetCacheAlertThrottle();
  });
  afterEach(() => vi.useRealTimers());

  it("n'alerte pas tant que la liste reste petite", async () => {
    const { getCachedFormations } = await import('./cachedFormations');
    getAllFormations.mockResolvedValue([makeFormation()]);

    await getCachedFormations();

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('avertit en approchant la limite', async () => {
    const { getCachedFormations } = await import('./cachedFormations');
    getAllFormations.mockResolvedValue(formationsPesant(1_500_000));

    await getCachedFormations();

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('signale une erreur au-delà de la limite', async () => {
    const { getCachedFormations } = await import('./cachedFormations');
    getAllFormations.mockResolvedValue(formationsPesant(2_000_000));

    await getCachedFormations();

    expect(logger.error).toHaveBeenCalledTimes(1);
    const [, , detail] = vi.mocked(logger.error).mock.calls[0];
    expect(detail).toMatchObject({ limit: 2_000_000 });
  });

  // Next refuse d'écrire l'entrée trop grosse, donc le callback repart à chaque
  // requête : sans bride, chaque requête produirait un événement Sentry.
  it("n'émet qu'une alerte par heure malgré des appels répétés", async () => {
    vi.useFakeTimers();
    const { getCachedFormations } = await import('./cachedFormations');
    getAllFormations.mockResolvedValue(formationsPesant(2_000_000));

    for (let i = 0; i < 25; i++) await getCachedFormations();
    expect(logger.error).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(61 * 60 * 1000);
    await getCachedFormations();
    expect(logger.error).toHaveBeenCalledTimes(2);
  });
});
