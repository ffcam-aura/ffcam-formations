import { unstable_cache } from 'next/cache';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from '@/services/formation/formations.service';
import { Formation } from '@/types/formation';

/**
 * Lectures publiques des formations, mises en cache.
 *
 * Les données ne changent qu'une fois par jour (sync planifié de 4h via
 * /api/sync). Inutile donc d'interroger Postgres à chaque requête : on cache
 * agressivement le résultat et on laisse la revalidation rafraîchir une fois
 * par jour. Cela évite de réveiller le compute Neon à chaque visite / crawl de
 * bot, qui était la cause d'une base active ~24/7.
 *
 * La fraîcheur reste alignée sur le sync : /api/sync appelle
 * `revalidateTag(FORMATIONS_CACHE_TAG)` à la fin de chaque synchro, ce qui
 * purge ces caches et fait refléter les nouvelles données en quelques minutes.
 */
export const FORMATIONS_CACHE_TAG = 'formations';

const ONE_DAY_SECONDS = 86_400;

const buildService = () => new FormationService(new FormationRepository());

export const getCachedFormations = unstable_cache(
  async (): Promise<Formation[]> => buildService().getAllFormations(),
  ['formations:all'],
  { revalidate: ONE_DAY_SECONDS, tags: [FORMATIONS_CACHE_TAG] }
);

export const getCachedDisciplines = unstable_cache(
  async (): Promise<string[]> => buildService().getAllDisciplines(),
  ['formations:disciplines'],
  { revalidate: ONE_DAY_SECONDS, tags: [FORMATIONS_CACHE_TAG] }
);

/**
 * Lecture d'une formation par référence, taguée explicitement `formations`.
 *
 * On inclut la référence dans la clé de cache pour avoir une entrée par
 * formation. Le tag permet à `revalidateTag(FORMATIONS_CACHE_TAG)` (appelé
 * après le sync) d'invalider aussi la page détail, sans dépendre du fait
 * qu'elle lise par ailleurs `getCachedFormations()`.
 */
export const getCachedFormationByReference = (
  reference: string
): Promise<Formation | null> =>
  unstable_cache(
    () => buildService().getFormationByReference(reference),
    ['formations:by-reference', reference],
    { revalidate: ONE_DAY_SECONDS, tags: [FORMATIONS_CACHE_TAG] }
  )();
