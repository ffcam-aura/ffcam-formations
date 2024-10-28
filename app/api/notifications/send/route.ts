import { prisma } from "@/lib/prisma";
import { NotificationRepository } from "@/repositories/NotificationRepository";
import { EmailService } from "@/services/email.service";
import { EmailTemplateRenderer } from "@/services/emailTemplateRenderer.service";
import { FormationsService } from "@/services/formations.service";
import { NotificationService } from "@/services/notifications.service";
import { UserService } from "@/services/users.service";

export async function GET(request: Request) {
  const emailRenderer = new EmailTemplateRenderer();
  const notificationRepo = new NotificationRepository(prisma);
  const notificationService = new NotificationService(
    notificationRepo,
    emailRenderer,
    EmailService,
    UserService
  );
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    // Récupère les formations des dernières 24h
    const recentFormations = await FormationsService.getRecentFormations(24);
    
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
    console.error('Error sending notifications:', error);
    return Response.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'