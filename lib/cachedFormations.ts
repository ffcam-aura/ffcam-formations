import { unstable_cache } from 'next/cache';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from '@/services/formation/formations.service';
import { Formation } from '@/types/formation';

// Lectures de formations en cache (données rafraîchies 1×/jour par le sync).
// Invalidées via revalidateTag(FORMATIONS_CACHE_TAG) dans /api/sync.
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

// reference dans la clé → une entrée de cache par formation.
export const getCachedFormationByReference = (
  reference: string
): Promise<Formation | null> =>
  unstable_cache(
    () => buildService().getFormationByReference(reference),
    ['formations:by-reference', reference],
    { revalidate: ONE_DAY_SECONDS, tags: [FORMATIONS_CACHE_TAG] }
  )();
