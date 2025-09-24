import { NotificationRepository } from "@/repositories/NotificationRepository";
import { Formation } from "@/types/formation";
import { UserService } from "@/services/user/users.service";
import { UserRepository } from "@/repositories/UserRepository";
import {
  filterTodaysFormations,
  shouldNotifyBasedOnTime,
  groupFormationsByUser,
  extractUniqueDisciplines,
  getStartOfDay,
  UserFormationData
} from "./notificationLogic";

// Ces instances globales seront progressivement supprimées
// Gardées temporairement pour la compatibilité
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export interface UserNotificationData {
    email: string;
    formations: Formation[];
  }
  
  export class NotificationProcessor {
    private actualUserService: UserService;
    private dateProvider: () => Date;

    constructor(
      private notificationRepo: NotificationRepository,
      userServiceOrType: UserService | typeof UserService,
      dateProvider?: () => Date
    ) {
      // Support pour l'ancien et le nouveau pattern
      if (userServiceOrType === UserService || typeof userServiceOrType === 'function') {
        // Ancien pattern avec typeof UserService
        this.actualUserService = userService; // Utilise la variable globale
      } else {
        // Nouveau pattern avec instance
        this.actualUserService = userServiceOrType as UserService;
      }
      this.dateProvider = dateProvider || (() => new Date());
    }
  
    async processFormations(formations: Formation[]): Promise<Map<string, UserNotificationData>> {
      const userNotifications = new Map<string, UserNotificationData>();
      const disciplines = extractUniqueDisciplines(formations);

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
      const usersToNotify = await this.actualUserService.getUsersToNotifyForDiscipline(discipline);

      const today = getStartOfDay(this.dateProvider());

      // Utilise la fonction pure pour filtrer
      const todaysFormations = filterTodaysFormations(formations, discipline, today);
    
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

      // Utilise la fonction pure pour la logique de temps
      return shouldNotifyBasedOnTime(
        lastNotification?.last_notified_at,
        this.dateProvider()
      );
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