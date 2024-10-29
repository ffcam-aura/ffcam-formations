import { IUserRepository } from "@/repositories/UserRepository";

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {}

    async getNotificationPreferences(userId: string): Promise<string[]> {
        try {
            return await this.userRepository.findNotificationPreferences(userId);
        } catch (error) {
            console.error('Error getting user preferences:', error);
            throw error;
        }
    }

    async updateNotificationPreferences(userId: string, email: string, disciplines: string[]): Promise<void> {
        try {
            const userPref = await this.userRepository.upsertUserPreferences(userId, email);
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
            console.error('Error updating user preferences:', error);
            throw error;
        }
    }

    async shouldNotifyForDiscipline(userId: string, discipline: string): Promise<boolean> {
        try {
            const count = await this.userRepository.countNotificationPreferences(userId, discipline);
            return count > 0;
        } catch (error) {
            console.error('Error checking notification status:', error);
            throw error;
        }
    }

    async updateLastNotified(userId: string, discipline: string): Promise<void> {
        try {
            await this.userRepository.updateLastNotified(userId, discipline);
        } catch (error) {
            console.error('Error updating last notified timestamp:', error);
            throw error;
        }
    }

    async getUsersToNotifyForDiscipline(discipline: string): Promise<Array<{userId: string, email: string}>> {
        try {
            const users = await this.userRepository.findUsersToNotify(discipline);
            return users.map(user => ({
                userId: user.user_id,
                email: user.email
            }));
        } catch (error) {
            console.error('Error getting users to notify:', error);
            throw error;
        }
    }
}