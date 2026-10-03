import { NotificationRepository } from "@/repositories/NotificationRepository";
import { EmailTemplateRenderer } from "./emailTemplate.service";
import { EmailService } from "@/services/email/email.service";
import { UserService } from "@/services/user/users.service";
import { Formation } from "@/types/formation";
import { NotificationProcessor, UserNotificationData } from "./notificationProcessor.service";
import { logger } from "@/lib/logger";

export interface NotificationResult {
  formation: Formation;
  usersNotified: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
  /** Abonné destinataire, pour un envoi réussi */
  userId?: string;
}

/** Bilan d'un envoi : abonnés et formations distincts (les résultats sont par paire abonné × formation). */
export function summarizeNotificationResults(results: NotificationResult[]) {
  const sent = results.filter(r => r.usersNotified > 0);
  return {
    usersNotified: new Set(sent.map(r => r.userId)).size,
    formationsSent: new Set(sent.map(r => r.formation.reference)).size,
    usersInError: new Set(results.flatMap(r => r.errors.map(e => e.userId))).size,
  };
}

export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
    private emailRenderer: EmailTemplateRenderer,
    private emailService: typeof EmailService,
    private userService: typeof UserService
  ) {}

  async notifyBatchNewFormations(formations: Formation[]): Promise<NotificationResult[]> {
    try {
      // Heure de début du run : sert à choisir les nouveautés et devient la date du dernier
      // email. Prendre l'heure après l'envoi ferait passer pour déjà envoyée une formation
      // apparue pendant l'envoi.
      const runStartedAt = new Date();
      const notificationProcessor = new NotificationProcessor(
        this.notificationRepo,
        this.userService,
        () => runStartedAt
      );

      // Step 1: Find users to notify (DB queries only, fast)
      const userNotifications = await notificationProcessor.processFormations(formations);

      // Step 2: Send emails OUTSIDE transaction (slow, network I/O)
      return await this.sendNotifications(userNotifications, runStartedAt);
    } catch (error) {
      logger.error('Error in batch notification', error as Error, {
        formationCount: formations.length
      });
      throw error;
    }
  }

  private async sendNotifications(
    userNotifications: Map<string, UserNotificationData>,
    notifiedAt: Date
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    for (const [userId, data] of userNotifications) {
      try {
        const htmlContent = this.emailRenderer.render(data.formations);
        await this.emailService.sendEmail({
          to: data.email,
          subject: this.emailRenderer.getSubject(data.formations),
          html: htmlContent
        });
      } catch (error) {
        results.push(...this.createErrorResults(userId, data.formations, error));
        continue;
      }

      // L'email est parti : un échec ici ne doit pas le compter en erreur. Sans date enregistrée,
      // ces formations seront renvoyées au prochain run (doublon plutôt que perte).
      try {
        await this.updateNotificationTimestamps(userId, data.formations, notifiedAt);
      } catch (error) {
        logger.error('Notifications : email envoyé mais date du dernier email non enregistrée', error as Error, { userId });
      }
      results.push(...this.createSuccessResults(userId, data.formations));
    }
    
    return results;
  }

  private async updateNotificationTimestamps(userId: string, formations: Formation[], notifiedAt: Date): Promise<void> {
    const disciplines = [...new Set(formations.map(f => f.discipline))];
    for (const discipline of disciplines) {
      await this.notificationRepo.updateLastNotified(userId, discipline, notifiedAt);
    }
  }

  private createSuccessResults(userId: string, formations: Formation[]): NotificationResult[] {
    return formations.map(formation => ({
      formation,
      usersNotified: 1,
      errors: [],
      userId
    }));
  }

  private createErrorResults(userId: string, formations: Formation[], error: unknown): NotificationResult[] {
    return formations.map(formation => ({
      formation,
      usersNotified: 0,
      errors: [{
        userId,
        error: error instanceof Error ? error.message : String(error)
      }]
    }));
  }
}