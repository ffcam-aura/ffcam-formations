import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from './UserRepository';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user_preferences: {
            findMany: vi.fn()
        }
    }
}));

describe('UserRepository.findUsersToNotify', () => {
    beforeEach(() => {
        vi.mocked(prisma.user_preferences.findMany).mockReset().mockResolvedValue([]);
    });

    it("ne filtre pas les abonnés sur la date de leur dernier email (géré par le processeur)", async () => {
        // Un filtre « dernier email il y a plus de 24h » écarte l'abonné notifié la veille :
        // ses nouveautés du lendemain seraient perdues.
        await new UserRepository().findUsersToNotify('Cartographie Orientation');

        const { where } = vi.mocked(prisma.user_preferences.findMany).mock.calls[0][0]!;
        expect(JSON.stringify(where)).not.toContain('last_notified_at');
        expect(where).toEqual({
            user_notification_preferences: {
                some: {
                    disciplines: { nom: 'Cartographie Orientation' },
                    enabled: true
                }
            }
        });
    });
});
