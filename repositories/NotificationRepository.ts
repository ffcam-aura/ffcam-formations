import { PrismaClient } from '@prisma/client';

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async getLastNotification(userId: string, discipline: string) {
    return await this.prisma.user_notification_preferences.findFirst({
      where: {
        user_preferences: {
          user_id: userId,
        },
        disciplines: {
          nom: discipline,
        },
      },
      select: {
        last_notified_at: true,
        // Date d'abonnement : point de départ du rattrapage tant qu'aucun email n'a été envoyé
        created_at: true,
      },
    });
  }

  // notifiedAt : heure de début du run d'envoi, pas l'heure après l'envoi (voir NotificationService)
  async updateLastNotified(userId: string, discipline: string, notifiedAt: Date) {
    await this.prisma.user_notification_preferences.updateMany({
      where: {
        user_preferences: {
          user_id: userId,
        },
        disciplines: {
          nom: discipline,
        },
      },
      data: {
        last_notified_at: notifiedAt,
      },
    });
  }
}