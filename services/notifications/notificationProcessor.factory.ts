import { NotificationProcessor } from './notificationProcessor.service';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { UserService } from '@/services/user/users.service';
import { UserRepository } from '@/repositories/UserRepository';
import { prisma } from '@/lib/prisma';

/**
 * Factory pour créer une instance de NotificationProcessor
 * avec injection de dépendances
 */
export interface NotificationProcessorDeps {
  notificationRepo?: NotificationRepository;
  userService?: UserService;
  dateProvider?: () => Date;
}

/**
 * Crée une instance de NotificationProcessor avec les dépendances par défaut
 * ou des overrides pour les tests
 *
 * @example
 * // Production
 * const processor = createNotificationProcessor();
 *
 * @example
 * // Tests
 * const processor = createNotificationProcessor({
 *   userService: mockUserService,
 *   dateProvider: () => new Date('2024-01-15')
 * });
 */
export function createNotificationProcessor(
  overrides?: NotificationProcessorDeps
): NotificationProcessor {
  // Instances par défaut
  const defaultNotificationRepo = new NotificationRepository(prisma);
  const defaultUserRepo = new UserRepository();
  const defaultUserService = new UserService(defaultUserRepo);

  return new NotificationProcessor(
    overrides?.notificationRepo || defaultNotificationRepo,
    overrides?.userService || defaultUserService,
    overrides?.dateProvider
  );
}

/**
 * Singleton pour l'instance de production
 * (évite de recréer les dépendances à chaque fois)
 */
let productionInstance: NotificationProcessor | null = null;

export function getNotificationProcessor(): NotificationProcessor {
  if (!productionInstance) {
    productionInstance = createNotificationProcessor();
  }
  return productionInstance;
}

/**
 * Reset le singleton (utile pour les tests)
 */
export function resetNotificationProcessor(): void {
  productionInstance = null;
}