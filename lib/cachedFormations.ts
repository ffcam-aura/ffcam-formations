import { unstable_cache } from 'next/cache';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from '@/services/formation/formations.service';
import { Formation } from '@/types/formation';
import { logger } from '@/lib/logger';

// Lectures de formations en cache (données rafraîchies 1×/jour par le sync).
// Invalidées via revalidateTag(FORMATIONS_CACHE_TAG) dans /api/sync.
export const FORMATIONS_CACHE_TAG = 'formations';

const ONE_DAY_SECONDS = 86_400;

const buildService = () => new FormationService(new FormationRepository());

// Next refuse silencieusement d'écrire une entrée de plus de 2 Mo : le cache
// cesserait de fonctionner sans rien casser de visible, et chaque requête
// repartirait réveiller Neon. On alerte avant d'atteindre la limite.
const CACHE_ENTRY_LIMIT_BYTES = 2_000_000;
const CACHE_WARN_THRESHOLD_BYTES = 1_500_000;

// Au-delà de la limite, Next refuse d'écrire l'entrée : le callback est
// réexécuté à chaque requête. Sans bride, l'alerte partirait autant de fois et
// noierait le quota Sentry, masquant d'autres incidents. Une émission par heure
// suffit à porter le signal.
const ALERT_INTERVAL_MS = 60 * 60 * 1000;
const lastAlertAt = new Map<string, number>();

function shouldAlert(key: string, now: number): boolean {
  const previous = lastAlertAt.get(key);
  if (previous !== undefined && now - previous < ALERT_INTERVAL_MS) return false;
  lastAlertAt.set(key, now);
  return true;
}

function warnIfCloseToCacheLimit(formations: Formation[]): void {
  const bytes = Buffer.byteLength(JSON.stringify(formations));
  if (bytes < CACHE_WARN_THRESHOLD_BYTES) return;

  const exceeded = bytes >= CACHE_ENTRY_LIMIT_BYTES;
  if (!shouldAlert(exceeded ? 'exceeded' : 'approaching', Date.now())) return;

  const detail = { bytes, limit: CACHE_ENTRY_LIMIT_BYTES, formations: formations.length };
  if (exceeded) {
    logger.error(
      'La liste des formations dépasse la limite du cache Next : elle n\'est plus mise en cache et chaque requête réveille la base.',
      new Error('FORMATIONS_CACHE_ENTRY_TOO_LARGE'),
      detail
    );
  } else {
    logger.warn('La liste des formations approche la limite de 2 Mo du cache Next.', detail);
  }
}

/** Réservé aux tests : la bride vit en mémoire du module. */
export function __resetCacheAlertThrottle(): void {
  lastAlertAt.clear();
}

export const getCachedFormations = unstable_cache(
  async (): Promise<Formation[]> => {
    const formations = await buildService().getAllFormations();
    warnIfCloseToCacheLimit(formations);
    return formations;
  },
  ['formations:all'],
  { revalidate: ONE_DAY_SECONDS, tags: [FORMATIONS_CACHE_TAG] }
);

export const getCachedDisciplines = unstable_cache(
  async (): Promise<string[]> => buildService().getAllDisciplines(),
  ['formations:disciplines'],
  { revalidate: ONE_DAY_SECONDS, tags: [FORMATIONS_CACHE_TAG] }
);

// reference dans la clé → une entrée de cache par formation.
export const getCachedFormationByReference = (
  reference: string
): Promise<Formation | null> =>
  unstable_cache(
    () => buildService().getFormationByReference(reference),
    ['formations:by-reference', reference],
    { revalidate: ONE_DAY_SECONDS, tags: [FORMATIONS_CACHE_TAG] }
  )();
