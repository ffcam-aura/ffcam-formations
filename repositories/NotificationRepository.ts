import { PrismaClient } from '@prisma/client';

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async getLastNotification(userId: string, discipline: string) {
    return await this.prisma.userNotificationPreference.findFirst({
      where: {
        userPreference: {
          userId: userId,
        },
        discipline: {
          nom: discipline,
        },
      },
      select: {
        lastNotifiedAt: true,
      },
    });
  }

  async updateLastNotified(userId: string, discipline: string) {
    await this.prisma.userNotificationPreference.updateMany({
      where: {
        userPreference: {
          userId: userId,
        },
        discipline: {
          nom: discipline,
        },
      },
      data: {
        lastNotifiedAt: new Date(),
      },
    });
  }
}