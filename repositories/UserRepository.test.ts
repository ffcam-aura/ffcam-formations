import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from './UserRepository';
import { prisma } from '@/lib/prisma';

const tx = vi.hoisted(() => ({
    user_preferences: { upsert: vi.fn() },
    disciplines: { findMany: vi.fn() },
    user_notification_preferences: { deleteMany: vi.fn(), createMany: vi.fn(), updateMany: vi.fn() }
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user_preferences: {
            findMany: vi.fn()
        },
        $transaction: vi.fn(async (operations: (client: typeof tx) => Promise<unknown>) => operations(tx))
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

describe('UserRepository.savePreferences', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        tx.user_preferences.upsert.mockResolvedValue({ id: 7 });
        tx.disciplines.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    });

    it('conserve les lignes des disciplines gardées, et donc la date de leur dernier email', async () => {
        // Supprimer puis recréer toutes les lignes remettait last_notified_at à zéro à chaque enregistrement
        await new UserRepository().savePreferences('u1', 'u1@test.com', ['Alpinisme', 'Escalade'], {});

        expect(tx.user_notification_preferences.deleteMany).toHaveBeenCalledWith({
            where: { user_preference_id: 7, OR: [{ discipline_id: { notIn: [1, 2] } }, { discipline_id: null }] }
        });
        expect(tx.user_notification_preferences.createMany).toHaveBeenCalledWith({
            data: [
                { user_preference_id: 7, discipline_id: 1, enabled: true },
                { user_preference_id: 7, discipline_id: 2, enabled: true }
            ],
            skipDuplicates: true
        });
        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('supprime toutes les lignes quand plus aucune discipline n’est suivie', async () => {
        await new UserRepository().savePreferences('u1', 'u1@test.com', [], {});

        expect(tx.disciplines.findMany).not.toHaveBeenCalled();
        expect(tx.user_notification_preferences.deleteMany).toHaveBeenCalledWith({
            where: { user_preference_id: 7, OR: [{ discipline_id: { notIn: [] } }, { discipline_id: null }] }
        });
        expect(tx.user_notification_preferences.createMany).not.toHaveBeenCalled();
    });
});
