import { prisma } from "@/lib/prisma";
import { NotificationRepository } from "@/repositories/NotificationRepository";
import { EmailService } from "@/services/email/email.service";
import { EmailTemplateRenderer } from "@/services/notifications/emailTemplate.service";
import { FormationService } from "@/services/formation/formations.service";
import { NotificationService } from "@/services/notifications/notifications.service";
import { UserService } from "@/services/user/users.service";
import { FormationRepository } from "@/repositories/FormationRepository";
import { UserRepository } from "@/repositories/UserRepository";
import {
  NOTIFICATION_WINDOW_HOURS,
  findUnnotifiedDisciplines,
  DisciplineReconciliation
} from "@/services/notifications/notificationLogic";
import { logger } from "@/lib/logger";
import { validateCronSecret, unauthorizedResponse } from "@/lib/auth";
import { env } from "@/env";

const formationRepository = new FormationRepository();
const formationService = new FormationService(formationRepository);
const userService = new UserService(new UserRepository());

type NotificationResult = Awaited<ReturnType<NotificationService["notifyBatchNewFormations"]>>[number];

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
    logger.info('Fetching recent formations...');
    const recentFormations = await formationService.getRecentFormations(NOTIFICATION_WINDOW_HOURS);
    logger.info(`Found ${recentFormations.length} recent formations`);

    // Envoie les notifications (le cas "0 formation" est géré naturellement : aucun envoi)
    let notificationResults: NotificationResult[] = [];
    if (recentFormations.length > 0) {
      logger.info('Sending notifications...');
      notificationResults = await notificationService.notifyBatchNewFormations(recentFormations);
    }

    // Réconciliation INDÉPENDANTE du filtre de notification : détecte un échec
    // silencieux (formations nouvelles + abonnés disponibles, mais 0 notifié).
    const reconciliation = await buildReconciliation(notificationResults);
    const missed = findUnnotifiedDisciplines(reconciliation);
    if (missed.length > 0) {
      logger.warn('Anomalie notifications: formations nouvelles non notifiées', { missed });
    }

    const stats = {
      totalFormations: recentFormations.length,
      notifiedUsers: notificationResults.reduce((acc, result) => acc + result.usersNotified, 0),
      errors: notificationResults.reduce((acc, result) => acc + result.errors.length, 0),
      formationsWithNotifications: notificationResults.filter(r => r.usersNotified > 0).length
    };

    // Healthcheck (dead man's switch) + alerte sur anomalie
    logger.info('Sending healthcheck email...', { stats, missed: missed.length });
    await sendHealthcheckEmail(stats, missed);

    return Response.json({
      success: true,
      message: missed.length > 0
        ? `ALERTE: ${missed.length} discipline(s) avec formations non notifiées`
        : `Notifications sent for ${stats.totalFormations} formations`,
      stats,
      missed
    });

  } catch (error) {
    logger.error('Erreur API /api/notifications/send', error, {
      stack: error instanceof Error ? error.stack : undefined
    });
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.VERCEL_ENV !== 'production' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}

/**
 * Construit la réconciliation par discipline à partir d'une requête `first_seen_at`
 * indépendante et des notifications réellement envoyées par ce run.
 */
async function buildReconciliation(
  notificationResults: NotificationResult[]
): Promise<DisciplineReconciliation[]> {
  const newByDiscipline = await formationService.getNewFormationCountsByDiscipline(NOTIFICATION_WINDOW_HOURS);

  const notifiedByDiscipline = new Map<string, number>();
  for (const result of notificationResults) {
    const discipline = result.formation.discipline;
    notifiedByDiscipline.set(discipline, (notifiedByDiscipline.get(discipline) ?? 0) + result.usersNotified);
  }

  const reconciliation: DisciplineReconciliation[] = [];
  for (const { discipline, count } of newByDiscipline) {
    const notifiable = await userService.getUsersToNotifyForDiscipline(discipline);
    reconciliation.push({
      discipline,
      newFormations: count,
      notifiableSubscribers: notifiable.length,
      notified: notifiedByDiscipline.get(discipline) ?? 0
    });
  }
  return reconciliation;
}

interface NotificationStats {
  totalFormations: number;
  notifiedUsers: number;
  errors: number;
  formationsWithNotifications: number;
}

async function sendHealthcheckEmail(
  stats: NotificationStats,
  missed: DisciplineReconciliation[] = []
): Promise<void> {
  const healthcheckEmail = env.HEALTHCHECK_NOTIFICATIONS_EMAIL;
  if (!healthcheckEmail) {
    logger.info('Healthcheck email not configured, skipping');
    return;
  }

  const hasAnomaly = missed.length > 0;
  const status = stats.errors === 0 && !hasAnomaly ? '✅' : '⚠️';
  const subject = hasAnomaly
    ? `⚠️ FFCAM ALERTE - ${missed.length} discipline(s) avec formations non notifiées`
    : `${status} FFCAM Notifications - ${stats.notifiedUsers} users, ${stats.totalFormations} formations`;

  const alertSection = hasAnomaly
    ? `
        <div style="border: 2px solid #dc2626; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <p style="color: #dc2626; font-weight: bold; margin: 0 0 8px;">⚠️ Formations nouvelles non notifiées</p>
          <p style="margin: 0 0 8px;">Des formations récentes existent dans des disciplines ayant des abonnés disponibles, mais aucune notification n'a été envoyée. Vérifier le pipeline de notification.</p>
          <ul>
            ${missed.map(m => `<li><strong>${m.discipline}</strong> : ${m.newFormations} formation(s) récente(s), ${m.notifiableSubscribers} abonné(s) en attente, 0 notifié</li>`).join('')}
          </ul>
        </div>
      `
    : '';

  try {
    await EmailService.sendEmail({
      to: healthcheckEmail,
      subject,
      html: `
        ${alertSection}
        <p><strong>Notifications FFCAM</strong></p>
        <ul>
          <li>Formations récentes: ${stats.totalFormations}</li>
          <li>Utilisateurs notifiés: ${stats.notifiedUsers}</li>
          <li>Erreurs: ${stats.errors}</li>
        </ul>
        <p><em>Cet email confirme que le système d'envoi fonctionne.</em></p>
      `
    });
    logger.info('Healthcheck email sent', { to: healthcheckEmail, hasAnomaly });
  } catch (error) {
    // Log but don't throw - healthcheck failure shouldn't break the response
    logger.warn('Failed to send healthcheck email', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export const dynamic = 'force-dynamic'