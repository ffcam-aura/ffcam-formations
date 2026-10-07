import { describe, it, expect, vi } from 'vitest';

// La route est appelée à chaque affichage de l'accueil : elle doit lire le
// cache, sans quoi chaque visite réveille Neon.
vi.mock('@/lib/cachedFormations', () => ({
  getCachedLastSync: vi.fn().mockResolvedValue('2026-10-07T04:00:36.324Z'),
}));

import { GET } from '../sync/last/route';

describe('GET /api/sync/last', () => {
  it('renvoie la date du dernier sync depuis le cache', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toBe('2026-10-07T04:00:36.324Z');
  });
});
