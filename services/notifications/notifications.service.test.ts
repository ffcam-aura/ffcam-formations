import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { NotificationService } from './notifications.service';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { EmailTemplateRenderer } from './emailTemplate.service';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/users.service';
import { NotificationProcessor } from './notificationProcessor.service';
import { prisma } from '@/lib/prisma';

// Mock des dépendances
vi.mock('@/repositories/NotificationRepository');
vi.mock('./emailTemplateRenderer.service');
vi.mock('./email.service');
vi.mock('./users.service');
vi.mock('./notificationProcessor.service');
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(callback => callback()),
  },
}));

describe('NotificationService', () => {
  // Données de test
  const mockFormations = [
    {
      reference: 'TEST123',
      titre: 'Formation Test',
      discipline: 'Escalade',
      dates: ['2024-05-01'],
      informationStagiaire: 'Info test',
      nombreParticipants: 10,
      placesRestantes: 5,
      lieu: 'Lyon',
      organisateur: 'CAF Lyon',
      responsable: 'Test User',
      emailContact: 'test@test.com',
      documents: [],
      hebergement: 'GITE'
    }
  ];

  const mockUserNotifications = new Map([
    ['user1', {
      email: 'user1@test.com',
      formations: mockFormations
    }]
  ]);

  let notificationService: NotificationService;
  let mockNotificationRepo: { updateLastNotified: Mock };
  let mockEmailRenderer: { render: Mock; getSubject: Mock };
  let mockEmailService: { sendEmail: Mock };
  let mockUserService: { getUsersToNotifyForDiscipline: Mock };

  beforeEach(() => {
    // Reset des mocks
    vi.clearAllMocks();

    // Setup des mocks
    mockNotificationRepo = {
      updateLastNotified: vi.fn()
    };

    mockEmailRenderer = {
      render: vi.fn().mockReturnValue('<html>Test email</html>'),
      getSubject: vi.fn().mockReturnValue('Test subject')
    };

    mockEmailService = {
      sendEmail: vi.fn()
    };

    mockUserService = {
      getUsersToNotifyForDiscipline: vi.fn()
    };

    vi.mocked(NotificationProcessor).mockImplementation(() => ({
      processFormations: vi.fn().mockResolvedValue(mockUserNotifications)
    }));

    // Création du service
    notificationService = new NotificationService(
      mockNotificationRepo as any,
      mockEmailRenderer as any,
      mockEmailService as any,
      mockUserService as any
    );
  });

  describe('notifyBatchNewFormations', () => {
    it('devrait traiter les notifications avec succès', async () => {
      // Exécution
      const results = await notificationService.notifyBatchNewFormations(mockFormations);

      // Vérifications
      expect(results).toHaveLength(mockFormations.length);
      expect(results[0].usersNotified).toBe(1);
      expect(results[0].errors).toHaveLength(0);
      
      // Vérifier que l'email a été envoyé
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'user1@test.com',
        subject: 'Test subject',
        html: '<html>Test email</html>'
      });

      // Vérifier que les timestamps ont été mis à jour
      expect(mockNotificationRepo.updateLastNotified)
        .toHaveBeenCalledWith('user1', 'Escalade');
    });

    it('devrait gérer les erreurs d\'envoi d\'email', async () => {
      // Setup de l'erreur
      const testError = new Error('Test error');
      mockEmailService.sendEmail.mockRejectedValueOnce(testError);

      // Exécution
      const results = await notificationService.notifyBatchNewFormations(mockFormations);

      // Vérifications
      expect(results).toHaveLength(mockFormations.length);
      expect(results[0].usersNotified).toBe(0);
      expect(results[0].errors).toHaveLength(1);
      expect(results[0].errors[0]).toEqual({
        userId: 'user1',
        error: 'Test error'
      });

      // Vérifier que les timestamps n'ont pas été mis à jour
      expect(mockNotificationRepo.updateLastNotified).not.toHaveBeenCalled();
    });

    it('devrait utiliser une transaction Prisma', async () => {
      // Exécution
      await notificationService.notifyBatchNewFormations(mockFormations);

      // Vérifier que la transaction a été utilisée
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('devrait propager les erreurs de processFormations', async () => {
      // Setup de l'erreur
      const testError = new Error('Process error');
      vi.mocked(NotificationProcessor).mockImplementationOnce(() => ({
        processFormations: vi.fn().mockRejectedValueOnce(testError)
      }));

      // Vérifier que l'erreur est propagée
      await expect(notificationService.notifyBatchNewFormations(mockFormations))
        .rejects.toThrow('Process error');
    });
  });

  describe('méthodes privées', () => {
    it('createSuccessResults devrait créer les bons résultats', () => {
      const results = (notificationService as any).createSuccessResults(mockFormations);
      
      expect(results).toHaveLength(mockFormations.length);
      expect(results[0]).toEqual({
        formation: mockFormations[0],
        usersNotified: 1,
        errors: []
      });
    });

    it('createErrorResults devrait créer les bons résultats d\'erreur', () => {
      const error = new Error('Test error');
      const results = (notificationService as any)
        .createErrorResults('user1', mockFormations, error);
      
      expect(results).toHaveLength(mockFormations.length);
      expect(results[0]).toEqual({
        formation: mockFormations[0],
        usersNotified: 0,
        errors: [{
          userId: 'user1',
          error: 'Test error'
        }]
      });
    });

    it('updateNotificationTimestamps devrait mettre à jour pour chaque discipline', async () => {
      await (notificationService as any)
        .updateNotificationTimestamps('user1', mockFormations);
      
      expect(mockNotificationRepo.updateLastNotified)
        .toHaveBeenCalledWith('user1', 'Escalade');
    });
  });
});