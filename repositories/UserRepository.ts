import { prisma } from "@/lib/prisma";

/** Filtres optionnels des alertes ; tableau vide = tous. Champ absent = valeur inchangée à l'enregistrement. */
export type NotificationFilters = {
    regions?: string[];
    niveaux?: string[];
};

export interface IUserRepository {
    findNotificationPreferences(userId: string): Promise<string[]>;
    findNotificationFilters(userId: string): Promise<{ regions: string[]; niveaux: string[] }>;
    savePreferences(userId: string, email: string, disciplines: string[], filters?: NotificationFilters): Promise<void>;
    countNotificationPreferences(userId: string, discipline: string): Promise<number>;
    updateLastNotified(userId: string, discipline: string): Promise<void>;
    findUsersToNotify(discipline: string): Promise<Array<{ user_id: string; email: string; regions: string[]; niveaux: string[] }>>;
}

type NotificationPreference = {
    disciplines: { nom: string | null; id: number; created_at: Date | null; updated_at: Date | null } | null;
    id: number;
    enabled: boolean | null;
    created_at: Date | null;
    updated_at: Date | null;
    discipline_id: number | null;
    user_preference_id: number | null;
    last_notified_at: Date | null;
};

export class UserRepository implements IUserRepository {
    async findNotificationPreferences(userId: string): Promise<string[]> {
        const preferences = await prisma.user_notification_preferences.findMany({
            where: {
                user_preferences: {
                    user_id: userId
                },
                enabled: true
            },
            include: {
                disciplines: true
            },
            orderBy: {
                disciplines: {
                    nom: 'asc'
                }
            }
        });

        return preferences
            .map((pref: NotificationPreference) => pref.disciplines?.nom)
            .filter((nom): nom is string => nom !== undefined && nom !== null);

    }

    async findNotificationFilters(userId: string): Promise<{ regions: string[]; niveaux: string[] }> {
        const preferences = await prisma.user_preferences.findUnique({
            where: { user_id: userId },
            select: { regions: true, niveaux: true }
        });
        return {
            regions: preferences?.regions ?? [],
            niveaux: preferences?.niveaux ?? []
        };
    }

    // Filtre absent = on ne touche pas à la valeur déjà enregistrée
    /**
     * Enregistre les préférences en une transaction. Les disciplines conservées gardent leur
     * ligne, donc la date de leur dernier email et leur date d'abonnement (point de départ du
     * rattrapage) ; seules les disciplines retirées sont supprimées, les nouvelles ajoutées.
     * Un filtre non fourni conserve la valeur déjà enregistrée.
     */
    async savePreferences(userId: string, email: string, disciplines: string[], filters: NotificationFilters = {}): Promise<void> {
        const { regions, niveaux } = filters;
        await prisma.$transaction(async (tx) => {
            const userPref = await tx.user_preferences.upsert({
                where: { user_id: userId },
                create: {
                    user_id: userId,
                    email,
                    regions: regions ?? [],
                    niveaux: niveaux ?? []
                },
                update: {
                    email,
                    ...(regions !== undefined && { regions }),
                    ...(niveaux !== undefined && { niveaux }),
                    updated_at: new Date()
                }
            });

            const disciplineIds = disciplines.length > 0
                ? (await tx.disciplines.findMany({ where: { nom: { in: disciplines } }, select: { id: true } })).map(d => d.id)
                : [];

            await tx.user_notification_preferences.deleteMany({
                where: { user_preference_id: userPref.id, OR: [{ discipline_id: { notIn: disciplineIds } }, { discipline_id: null }] }
            });

            if (disciplineIds.length > 0) {
                await tx.user_notification_preferences.createMany({
                    data: disciplineIds.map(discipline_id => ({ user_preference_id: userPref.id, discipline_id, enabled: true })),
                    skipDuplicates: true
                });
            }
        });
    }

    async countNotificationPreferences(userId: string, discipline: string): Promise<number> {
        return await prisma.user_notification_preferences.count({
            where: {
                user_preferences: {
                    user_id: userId
                },
                disciplines: {
                    nom: discipline
                },
                enabled: true
            }
        });
    }

    async updateLastNotified(userId: string, discipline: string): Promise<void> {
        await prisma.user_notification_preferences.updateMany({
            where: {
                user_preferences: {
                    user_id: userId
                },
                disciplines: {
                    nom: discipline
                }
            },
            data: {
                last_notified_at: new Date()
            }
        });
    }

    async findUsersToNotify(discipline: string): Promise<Array<{ user_id: string; email: string; regions: string[]; niveaux: string[] }>> {
        const users = await prisma.user_preferences.findMany({
            where: {
                user_notification_preferences: {
                    some: {
                        disciplines: {
                            nom: discipline
                        },
                        // Pas de filtre sur last_notified_at : le processeur n'envoie que les
                        // formations parues depuis le dernier email de chaque abonné
                        enabled: true
                    }
                }
            },
            select: {
                user_id: true,
                email: true,
                regions: true,
                niveaux: true
            }
        });
        // Les colonnes sont nullables en base (listes Prisma) : on normalise en []
        return users.map((user: { user_id: string; email: string; regions: string[] | null; niveaux: string[] | null }) => ({
            ...user,
            regions: user.regions ?? [],
            niveaux: user.niveaux ?? []
        }));
    }
}