import { prisma } from "@/lib/prisma";
import { NotificationRepository } from "@/repositories/NotificationRepository";
import { EmailService } from "@/services/email/email.service";
import { EmailTemplateRenderer } from "@/services/notifications/emailTemplate.service";
import { FormationService } from "@/services/formation/formations.service";
import { NotificationService, summarizeNotificationResults } from "@/services/notifications/notifications.service";
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
    // Formations encore en ligne (vues par la sync des dernières 24h). Le processeur ne garde
    // que celles parues depuis le dernier email de chaque abonné (72h au plus).
    logger.info('Fetching recent formations...');
    const recentFormations = await formationService.getRecentFormations(24);
    logger.info(`Found ${recentFormations.length} recent formations`);

    if (recentFormations.length === 0) {
      // Still send healthcheck to confirm email system works
      logger.info('No formations, sending healthcheck email...');
      await sendHealthcheckEmail({ onlineFormations: 0, usersNotified: 0, formationsSent: 0, usersInError: 0 });

      return Response.json({
        success: true,
        message: 'No recent formations to notify about',
        notified: 0
      });
    }

    // Envoie les notifications
    logger.info('Sending notifications...');
    const notificationResults = await notificationService.notifyBatchNewFormations(recentFormations);

    // Bilan en abonnés et formations distincts (les résultats sont par paire abonné × formation)
    const stats = {
      onlineFormations: recentFormations.length,
      ...summarizeNotificationResults(notificationResults)
    };

    // Send healthcheck email (tests full email delivery chain)
    logger.info('Sending healthcheck email...', { stats });
    await sendHealthcheckEmail(stats);

    return Response.json({
      success: true,
      message: `Notifications sent to ${stats.usersNotified} users (${stats.formationsSent} formations)`,
      stats
    });

  } catch (error) {
    logger.error('Erreur API /api/notifications/send', error, {
      stack: error instanceof Error ? error.stack : undefined
    });
    // Sans cet email, une panne ne se voit qu'en remarquant l'absence du message habituel
    await sendHealthcheckFailure(error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.VERCEL_ENV !== 'production' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}

interface NotificationStats {
  onlineFormations: number;
  usersNotified: number;
  formationsSent: number;
  usersInError: number;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function sendHealthcheckEmail(stats: NotificationStats): Promise<void> {
  const healthcheckEmail = env.HEALTHCHECK_NOTIFICATIONS_EMAIL;
  if (!healthcheckEmail) {
    logger.info('Healthcheck email not configured, skipping');
    return;
  }

  const status = stats.usersInError === 0 ? '✅' : '⚠️';
  const subject = `${status} FFCAM Notifications - ${stats.usersNotified} abonnés notifiés, ${stats.formationsSent} formations envoyées`;

  try {
    await EmailService.sendEmail({
      to: healthcheckEmail,
      subject,
      html: `
        <p><strong>Notifications FFCAM</strong></p>
        <ul>
          <li>Formations en ligne : ${stats.onlineFormations}</li>
          <li>Abonnés notifiés : ${stats.usersNotified}</li>
          <li>Formations envoyées : ${stats.formationsSent}</li>
          <li>Abonnés en erreur : ${stats.usersInError}</li>
        </ul>
        <p><em>Cet email confirme que le système d'envoi fonctionne.</em></p>
      `
    });
    logger.info('Healthcheck email sent', { email: healthcheckEmail });
  } catch (error) {
    // Log but don't throw - healthcheck failure shouldn't break the response
    logger.warn('Failed to send healthcheck email', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function sendHealthcheckFailure(error: unknown): Promise<void> {
  const healthcheckEmail = env.HEALTHCHECK_NOTIFICATIONS_EMAIL;
  if (!healthcheckEmail) return;

  const message = (error instanceof Error ? error.message : String(error)).slice(0, 300);
  try {
    await EmailService.sendEmail({
      to: healthcheckEmail,
      subject: "❌ FFCAM Notifications - échec de l'envoi",
      html: `
        <p><strong>L'envoi des notifications a échoué.</strong></p>
        <p>${escapeHtml(message)}</p>
        <p><em>Les formations non envoyées seront rattrapées au prochain run (jusqu'à 72h).</em></p>
      `
    });
  } catch (sendError) {
    logger.warn('Failed to send healthcheck failure email', {
      error: sendError instanceof Error ? sendError.message : String(sendError)
    });
  }
}

export const dynamic = 'force-dynamic'
// Envoi séquentiel des emails : on garde la limite maximale d'une fonction
export const maxDuration = 300