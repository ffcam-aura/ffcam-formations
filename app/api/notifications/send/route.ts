import { prisma } from "@/lib/prisma";
import { NotificationRepository } from "@/repositories/NotificationRepository";
import { EmailService } from "@/services/email/email.service";
import { EmailTemplateRenderer } from "@/services/notifications/emailTemplate.service";
import { FormationService } from "@/services/formation/formations.service";
import { NotificationService } from "@/services/notifications/notifications.service";
import { UserService } from "@/services/user/users.service";
import { FormationRepository } from "@/repositories/FormationRepository";
import { logger } from "@/lib/logger";
import { validateCronSecret, unauthorizedResponse } from "@/lib/auth";

const formationRepository = new FormationRepository();
const formationService = new FormationService(formationRepository);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!validateCronSecret(authHeader)) {
    return unauthorizedResponse();
  }

  const emailRenderer = new EmailTemplateRenderer();
  const notificationRepo = new NotificationRepository(prisma);
  const notificationService = new NotificationService(
    notificationRepo,
    emailRenderer,
    EmailService,
    UserService
  );

  try {
    // Récupère les formations des dernières 24h
    const recentFormations = await formationService.getRecentFormations(24);
    
    if (recentFormations.length === 0) {
      return Response.json({
        success: true,
        message: 'No recent formations to notify about',
        notified: 0
      });
    }

    // Envoie les notifications
    const notificationResults = await notificationService.notifyBatchNewFormations(recentFormations);

    // Calcule les statistiques de notification
    const stats = {
      totalFormations: recentFormations.length,
      notifiedUsers: notificationResults.reduce((acc, result) => acc + result.usersNotified, 0),
      errors: notificationResults.reduce((acc, result) => acc + result.errors.length, 0),
      formationsWithNotifications: notificationResults.filter(r => r.usersNotified > 0).length
    };

    return Response.json({
      success: true,
      message: `Notifications sent for ${stats.totalFormations} formations`,
      stats
    });

  } catch (error) {
    logger.error('Erreur API /api/notifications/send', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'