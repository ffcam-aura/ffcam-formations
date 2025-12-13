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
import { env } from "@/env";

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
      // Still send healthcheck to confirm email system works
      await sendHealthcheckEmail({ totalFormations: 0, notifiedUsers: 0, errors: 0, formationsWithNotifications: 0 });

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

    // Send healthcheck email (tests full email delivery chain)
    await sendHealthcheckEmail(stats);

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

interface NotificationStats {
  totalFormations: number;
  notifiedUsers: number;
  errors: number;
  formationsWithNotifications: number;
}

async function sendHealthcheckEmail(stats: NotificationStats): Promise<void> {
  const healthcheckEmail = env.HEALTHCHECK_NOTIFICATIONS_EMAIL;
  if (!healthcheckEmail) {
    logger.info('Healthcheck email not configured, skipping');
    return;
  }

  const status = stats.errors === 0 ? '✅' : '⚠️';
  const subject = `${status} FFCAM Notifications - ${stats.notifiedUsers} users, ${stats.totalFormations} formations`;

  try {
    await EmailService.sendEmail({
      to: healthcheckEmail,
      subject,
      html: `
        <p><strong>Notifications FFCAM</strong></p>
        <ul>
          <li>Formations récentes: ${stats.totalFormations}</li>
          <li>Utilisateurs notifiés: ${stats.notifiedUsers}</li>
          <li>Erreurs: ${stats.errors}</li>
        </ul>
        <p><em>Cet email confirme que le système d'envoi fonctionne.</em></p>
      `
    });
    logger.info('Healthcheck email sent', { to: healthcheckEmail });
  } catch (error) {
    // Log but don't throw - healthcheck failure shouldn't break the response
    logger.warn('Failed to send healthcheck email', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export const dynamic = 'force-dynamic'