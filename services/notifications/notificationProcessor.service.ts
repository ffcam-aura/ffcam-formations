import { NotificationRepository } from "@/repositories/NotificationRepository";
import { Formation } from "@/types/formation";
import { UserService } from "@/services/user/users.service";
import { UserRepository } from "@/repositories/UserRepository";
import { filterFormationsByRegions } from "@/lib/regions";
import { filterFormationsByNiveaux } from "@/lib/niveaux";
import { logger } from "@/lib/logger";
import {
  filterFormationsSince,
  getLookbackStart,
  getNotifiableSince,
  extractUniqueDisciplines
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
      const now = this.dateProvider();
      const candidates = filterFormationsSince(formations, discipline, getLookbackStart(now));

      // Rien dans la fenêtre de rattrapage : on évite la requête de récupération des utilisateurs
      if (candidates.length === 0) {
        return;
      }

      // Une erreur sur une discipline ou un abonné est journalisée sans bloquer les autres envois
      let usersToNotify: Awaited<ReturnType<UserService['getUsersToNotifyForDiscipline']>>;
      try {
        usersToNotify = await this.actualUserService.getUsersToNotifyForDiscipline(discipline);
      } catch (error) {
        logger.error('Notifications : abonnés illisibles, discipline ignorée', error as Error, { discipline });
        return;
      }

      for (const {userId, email, regions, niveaux} of usersToNotify) {
        // Filtres optionnels par comité régional organisateur et niveau de stage (vide = tous)
        const formationsForFilters = filterFormationsByNiveaux(
          filterFormationsByRegions(candidates, regions),
          niveaux
        );
        if (formationsForFilters.length === 0) continue;

        // Seulement les formations apparues depuis le dernier email de l'abonné
        let lastNotification: Awaited<ReturnType<NotificationRepository['getLastNotification']>>;
        try {
          lastNotification = await this.notificationRepo.getLastNotification(userId, discipline);
        } catch (error) {
          logger.error('Notifications : dernier email illisible, abonné ignoré pour cette discipline', error as Error, { userId, discipline });
          continue;
        }
        const since = getNotifiableSince(lastNotification?.last_notified_at, now, lastNotification?.created_at);
        const formationsForUser = filterFormationsSince(formationsForFilters, discipline, since);
        if (formationsForUser.length === 0) continue;

        this.addFormationsForUser(
          userId,
          email,
          formationsForUser,
          userNotifications
        );
      }
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