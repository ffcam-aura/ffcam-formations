import { NotificationRepository } from "@/repositories/NotificationRepository";
import { Formation } from "@/types/formation";
import { UserService } from "./users.service";

export interface UserNotificationData {
    email: string;
    formations: Formation[];
  }
  
  export class NotificationProcessor {
    constructor(
      private notificationRepo: NotificationRepository,
      private userService: typeof UserService
    ) {}
  
    async processFormations(formations: Formation[]): Promise<Map<string, UserNotificationData>> {
      const userNotifications = new Map<string, UserNotificationData>();
      const disciplines = [...new Set(formations.map(f => f.discipline))];
  
      for (const discipline of disciplines) {
        await this.processFormationsForDiscipline(
          discipline,
          formations,
          userNotifications
        );
      }
  
      return userNotifications;
    }
  
    private async processFormationsForDiscipline(
      discipline: string,
      formations: Formation[],
      userNotifications: Map<string, UserNotificationData>
    ): Promise<void> {
      const usersToNotify = await this.userService.getUsersToNotifyForDiscipline(discipline);
      
      for (const {userId, email} of usersToNotify) {
        if (await this.shouldNotifyUser(userId, discipline)) {
          this.addFormationsForUser(
            userId,
            email,
            formations.filter(f => f.discipline === discipline),
            userNotifications
          );
        }
      }
    }
  
    private async shouldNotifyUser(userId: string, discipline: string): Promise<boolean> {
      const lastNotification = await this.notificationRepo.getLastNotification(userId, discipline);
      if (!lastNotification?.lastNotifiedAt) return true;
  
      const timeSinceLastNotification = new Date().getTime() - lastNotification.lastNotifiedAt.getTime();
      return timeSinceLastNotification > 24 * 60 * 60 * 1000;
    }
  
    private addFormationsForUser(
      userId: string,
      email: string,
      formations: Formation[],
      userNotifications: Map<string, UserNotificationData>
    ): void {
      if (!userNotifications.has(userId)) {
        userNotifications.set(userId, { email, formations: [] });
      }
      userNotifications.get(userId)!.formations.push(...formations);
    }
  }