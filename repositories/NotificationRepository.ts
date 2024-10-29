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
      },
    });
  }

  async updateLastNotified(userId: string, discipline: string) {
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
        last_notified_at: new Date(),
      },
    });
  }
}