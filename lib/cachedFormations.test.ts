import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';
import { makeFormation } from '@/test/factories';

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const getAllFormations = vi.fn();
const getFormationByReference = vi.fn();
const getLastSync = vi.fn();
vi.mock('@/services/formation/formations.service', () => ({
  FormationService: vi.fn(() => ({ getAllFormations, getFormationByReference, getLastSync })),
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

// Chaque requête par référence réveille Neon : une fiche doit se servir de la
// liste partagée, reconstruite une seule fois par sync.
describe('findCachedFormation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sert une fiche présente dans la liste sans requête par référence', async () => {
    const { findCachedFormation } = await import('./cachedFormations');
    const cible = makeFormation({ reference: '2027ESESINI84705' });
    getAllFormations.mockResolvedValue([makeFormation({ reference: '2026ALALINT84704' }), cible]);

    const formation = await findCachedFormation('2027ESESINI84705');

    expect(formation).toEqual(cible);
    expect(getFormationByReference).not.toHaveBeenCalled();
  });

  it('retombe sur la requête par référence pour une fiche absente de la liste', async () => {
    const { findCachedFormation } = await import('./cachedFormations');
    const absente = makeFormation({ reference: '2024ESESINI84701' });
    getAllFormations.mockResolvedValue([makeFormation({ reference: '2026ALALINT84704' })]);
    getFormationByReference.mockResolvedValue(absente);

    const formation = await findCachedFormation('2024ESESINI84701');

    expect(formation).toEqual(absente);
    expect(getFormationByReference).toHaveBeenCalledWith('2024ESESINI84701');
  });

  it('renvoie null pour une référence inconnue', async () => {
    const { findCachedFormation } = await import('./cachedFormations');
    getAllFormations.mockResolvedValue([makeFormation({ reference: '2026ALALINT84704' })]);
    getFormationByReference.mockResolvedValue(null);

    expect(await findCachedFormation('2099XXXX00000')).toBeNull();
  });
});

// unstable_cache stocke du JSON : la date sort en ISO, comme la sérialisait la route.
describe('getCachedLastSync', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renvoie la date du dernier sync au format ISO', async () => {
    const { getCachedLastSync } = await import('./cachedFormations');
    getLastSync.mockResolvedValue(new Date('2026-10-07T04:00:36.324Z'));

    expect(await getCachedLastSync()).toBe('2026-10-07T04:00:36.324Z');
  });

  it('renvoie null tant qu\'aucun sync n\'a eu lieu', async () => {
    const { getCachedLastSync } = await import('./cachedFormations');
    getLastSync.mockResolvedValue(null);

    expect(await getCachedLastSync()).toBeNull();
  });
});
