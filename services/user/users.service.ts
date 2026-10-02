import { IUserRepository } from "@/repositories/UserRepository";
import { logger } from "@/lib/logger";

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {}

    async getNotificationSettings(userId: string): Promise<{ disciplines: string[]; regions: string[] }> {
        try {
            const [disciplines, regions] = await Promise.all([
                this.userRepository.findNotificationPreferences(userId),
                this.userRepository.findNotificationRegions(userId)
            ]);
            return { disciplines, regions };
        } catch (error) {
            logger.error('Error getting user notification settings', error as Error, { userId });
            throw error;
        }
    }

    /**
     * @param regions codes région des comités organisateurs à suivre ([] = tous) ;
     *                non fourni = conserve les régions déjà enregistrées.
     */
    async updateNotificationPreferences(userId: string, email: string, disciplines: string[], regions?: string[]): Promise<void> {
        try {
            const userPref = await this.userRepository.upsertUserPreferences(userId, email, regions);
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
            logger.error('Error updating user preferences', error as Error, { userId, email, disciplines, regions });
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

    async getUsersToNotifyForDiscipline(discipline: string): Promise<Array<{userId: string, email: string, regions: string[]}>> {
        try {
            const users = await this.userRepository.findUsersToNotify(discipline);
            return users.map(user => ({
                userId: user.user_id,
                email: user.email,
                regions: user.regions ?? []
            }));
        } catch (error) {
            logger.error('Error getting users to notify', error as Error, { discipline });
            throw error;
        }
    }
}