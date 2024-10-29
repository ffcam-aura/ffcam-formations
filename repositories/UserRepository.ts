import { prisma } from "@/lib/prisma";

export interface IUserRepository {
    findNotificationPreferences(userId: string): Promise<string[]>;
    upsertUserPreferences(userId: string, email: string): Promise<{ id: number }>;
    deleteNotificationPreferences(userPreferenceId: number): Promise<void>;
    findDisciplinesByNames(disciplines: string[]): Promise<Array<{ id: number; nom: string }>>;
    createNotificationPreferences(preferences: Array<{ user_preference_id: number; discipline_id: number; enabled: boolean }>): Promise<void>;
    countNotificationPreferences(userId: string, discipline: string): Promise<number>;
    updateLastNotified(userId: string, discipline: string): Promise<void>;
    findUsersToNotify(discipline: string): Promise<Array<{ user_id: string; email: string }>>;
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

    async upsertUserPreferences(userId: string, email: string): Promise<{ id: number }> {
        return await prisma.user_preferences.upsert({
            where: { user_id: userId },
            create: {
                user_id: userId,
                email
            },
            update: {
                email,
                updated_at: new Date()
            }
        });
    }

    async deleteNotificationPreferences(userPreferenceId: number): Promise<void> {
        await prisma.user_notification_preferences.deleteMany({
            where: {
                user_preference_id: userPreferenceId
            }
        });
    }

    async findDisciplinesByNames(disciplines: string[]): Promise<Array<{ id: number; nom: string }>> {
        return await prisma.disciplines.findMany({
            where: {
                nom: {
                    in: disciplines
                }
            }
        });
    }

    async createNotificationPreferences(preferences: Array<{ user_preference_id: number; discipline_id: number; enabled: boolean }>): Promise<void> {
        await prisma.user_notification_preferences.createMany({
            data: preferences
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

    async findUsersToNotify(discipline: string): Promise<Array<{ user_id: string; email: string }>> {
        return await prisma.user_preferences.findMany({
            where: {
                user_notification_preferences: {
                    some: {
                        disciplines: {
                            nom: discipline
                        },
                        enabled: true,
                        OR: [
                            { last_notified_at: null },
                            {
                                last_notified_at: {
                                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                                }
                            }
                        ]
                    }
                }
            },
            select: {
                user_id: true,
                email: true
            }
        });
    }
}