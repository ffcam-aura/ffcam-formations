import { describe, it, expect, vi } from 'vitest';
import { UserService } from './users.service';
import type { IUserRepository } from '@/repositories/UserRepository';

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

describe('UserService.updateNotificationPreferences', () => {
  it('enregistre disciplines et filtres en une seule opération du repository (transactionnelle)', async () => {
    const savePreferences = vi.fn().mockResolvedValue(undefined);
    const service = new UserService({ savePreferences } as unknown as IUserRepository);

    await service.updateNotificationPreferences('u1', 'u1@test.com', ['Alpinisme'], { regions: ['84'] });

    expect(savePreferences).toHaveBeenCalledWith('u1', 'u1@test.com', ['Alpinisme'], { regions: ['84'] });
  });
});
