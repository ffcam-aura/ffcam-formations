import { NotificationRepository } from "@/repositories/NotificationRepository";
import { EmailTemplateRenderer } from "./emailTemplateRenderer.service";
import { EmailService } from "./email.service";
import { UserService } from "./users.service";
import { Formation } from "@/types/formation";
import { NotificationProcessor, UserNotificationData } from "./notificationProcessor.service";
import { prisma } from "@/lib/prisma";

interface NotificationResult {
  formation: Formation;
  usersNotified: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
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
      // Passer le userService au NotificationProcessor
      const notificationProcessor = new NotificationProcessor(
        this.notificationRepo,
        this.userService  // Passer le service
      );

      return await prisma.$transaction(async () => {
        const userNotifications = await notificationProcessor.processFormations(formations);
        return await this.sendNotifications(userNotifications);
      });
    } catch (error) {
      console.error('Error in batch notification:', error);
      throw error;
    }
  }

  private async sendNotifications(
    userNotifications: Map<string, UserNotificationData>
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
        
        await this.updateNotificationTimestamps(userId, data.formations);
        results.push(...this.createSuccessResults(data.formations));
      } catch (error) {
        results.push(...this.createErrorResults(userId, data.formations, error));
      }
    }
    
    return results;
  }

  private async updateNotificationTimestamps(userId: string, formations: Formation[]): Promise<void> {
    const disciplines = [...new Set(formations.map(f => f.discipline))];
    for (const discipline of disciplines) {
      await this.notificationRepo.updateLastNotified(userId, discipline);
    }
  }

  private createSuccessResults(formations: Formation[]): NotificationResult[] {
    return formations.map(formation => ({
      formation,
      usersNotified: 1,
      errors: []
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