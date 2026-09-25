import { IUserRepository, NotificationFilters } from "@/repositories/UserRepository";
import { logger } from "@/lib/logger";

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {}

    async getNotificationSettings(userId: string): Promise<{ disciplines: string[]; regions: string[]; niveaux: string[] }> {
        try {
            const [disciplines, filters] = await Promise.all([
                this.userRepository.findNotificationPreferences(userId),
                this.userRepository.findNotificationFilters(userId)
            ]);
            return { disciplines, ...filters };
        } catch (error) {
            logger.error('Error getting user notification settings', error as Error, { userId });
            throw error;
        }
    }

    /**
     * @param filters régions des comités organisateurs et niveaux de stage à suivre ([] = tous) ;
     *                un filtre non fourni conserve la valeur déjà enregistrée.
     */
    async updateNotificationPreferences(userId: string, email: string, disciplines: string[], filters: NotificationFilters = {}): Promise<void> {
        try {
            const userPref = await this.userRepository.upsertUserPreferences(userId, email, filters);
            await this.userRepository.deleteNotificationPreferences(userPref.id);

            if (disciplines.length > 0) {
                const disciplineRecords = await this.userRepository.findDisciplinesByNames(disciplines);
                
                await this.userRepository.createNotificationPreferences(
                    disciplineRecords.map(discipline => ({
                        user_preference_id: userPref.id,
                        discipline_id: discipline.id,
                        enabled: true
                    }))
                );
            }
        } catch (error) {
            logger.error('Error updating user preferences', error as Error, { userId, email, disciplines, ...filters });
            throw error;
        }
    }

    async shouldNotifyForDiscipline(userId: string, discipline: string): Promise<boolean> {
        try {
            const count = await this.userRepository.countNotificationPreferences(userId, discipline);
            return count > 0;
        } catch (error) {
            logger.error('Error checking notification status', error as Error, { userId, discipline });
            throw error;
        }
    }

    async updateLastNotified(userId: string, discipline: string): Promise<void> {
        try {
            await this.userRepository.updateLastNotified(userId, discipline);
        } catch (error) {
            logger.error('Error updating last notified timestamp', error as Error, { userId, discipline });
            throw error;
        }
    }

    async getUsersToNotifyForDiscipline(discipline: string): Promise<Array<{userId: string, email: string, regions: string[], niveaux: string[]}>> {
        try {
            const users = await this.userRepository.findUsersToNotify(discipline);
            return users.map(user => ({
                userId: user.user_id,
                email: user.email,
                regions: user.regions ?? [],
                niveaux: user.niveaux ?? []
            }));
        } catch (error) {
            logger.error('Error getting users to notify', error as Error, { discipline });
            throw error;
        }
    }
}