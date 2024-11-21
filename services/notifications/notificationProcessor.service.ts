import { NotificationRepository } from "@/repositories/NotificationRepository";
import { Formation } from "@/types/formation";
import { UserService } from "@/services/user/users.service";
import { UserRepository } from "@/repositories/UserRepository";
import { isSameDay } from "date-fns";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

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
      const usersToNotify = await userService.getUsersToNotifyForDiscipline(discipline);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
    
      const todaysFormations = formations.filter(f => 
        f.discipline === discipline && 
        f.firstSeenAt &&
        isSameDay(new Date(f.firstSeenAt), today)
      );
    
      // Si aucune formation du jour, on peut éviter de traiter les utilisateurs
      if (todaysFormations.length === 0) {
        return;
      }
    
      for (const {userId, email} of usersToNotify) {
        if (await this.shouldNotifyUser(userId, discipline)) {
          this.addFormationsForUser(
            userId,
            email,
            todaysFormations,
            userNotifications
          );
        }
      }
    }
  
    private async shouldNotifyUser(userId: string, discipline: string): Promise<boolean> {
      const lastNotification = await this.notificationRepo.getLastNotification(userId, discipline);
      if (!lastNotification?.last_notified_at) return true;
  
      const timeSinceLastNotification = new Date().getTime() - lastNotification.last_notified_at.getTime();
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