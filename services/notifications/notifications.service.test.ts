import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { NotificationService, summarizeNotificationResults } from './notifications.service';
import { NotificationProcessor } from './notificationProcessor.service';
import { makeFormation } from '@/test/factories';

// Mock des dépendances
vi.mock('@/repositories/NotificationRepository');
vi.mock('./emailTemplateRenderer.service');
vi.mock('./email.service');
vi.mock('./users.service');
vi.mock('./notificationProcessor.service');

describe('NotificationService', () => {
  // Données de test
  const mockFormations = [
    makeFormation({
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
      hebergement: 'GITE',
    }),
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
    }) as unknown as NotificationProcessor);

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
        .toHaveBeenCalledWith('user1', 'Escalade', expect.any(Date));
    });

    it("enregistre comme date du dernier email l'heure de début du run, pas l'heure après l'envoi", async () => {
      // Sinon une formation apparue pendant l'envoi serait considérée comme déjà envoyée
      vi.useFakeTimers();
      try {
        vi.setSystemTime(new Date('2026-10-01T06:00:01Z'));
        mockEmailService.sendEmail.mockImplementation(async () => {
          vi.setSystemTime(new Date('2026-10-01T06:01:14Z'));
        });

        await notificationService.notifyBatchNewFormations(mockFormations);

        expect(mockNotificationRepo.updateLastNotified)
          .toHaveBeenCalledWith('user1', 'Escalade', new Date('2026-10-01T06:00:01Z'));
        // Le processeur choisit les nouveautés à partir de ce même instant
        const dateProvider = vi.mocked(NotificationProcessor).mock.calls[0][2];
        expect(dateProvider?.()).toEqual(new Date('2026-10-01T06:00:01Z'));
      } finally {
        vi.useRealTimers();
      }
    });

    it("compte l'email comme envoyé même si l'enregistrement de la date échoue ensuite", async () => {
      // L'abonné a bien reçu l'email : le compter en erreur fausse le contrôle (et la date sera rattrapée au run suivant)
      mockNotificationRepo.updateLastNotified.mockRejectedValue(new Error('base indisponible'));

      const results = await notificationService.notifyBatchNewFormations(mockFormations);

      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(results[0].usersNotified).toBe(1);
      expect(results[0].errors).toHaveLength(0);
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

    it('devrait propager les erreurs de processFormations', async () => {
      // Setup de l'erreur
      const testError = new Error('Process error');
      vi.mocked(NotificationProcessor).mockImplementationOnce(() => ({
        processFormations: vi.fn().mockRejectedValueOnce(testError)
      }) as unknown as NotificationProcessor);

      // Vérifier que l'erreur est propagée
      await expect(notificationService.notifyBatchNewFormations(mockFormations))
        .rejects.toThrow('Process error');
    });
  });

  describe('méthodes privées', () => {
    it('createSuccessResults devrait créer les bons résultats', () => {
      const results = (notificationService as any).createSuccessResults('user1', mockFormations);
      
      expect(results).toHaveLength(mockFormations.length);
      expect(results[0]).toEqual({
        formation: mockFormations[0],
        usersNotified: 1,
        errors: [],
        userId: 'user1'
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
      const notifiedAt = new Date('2026-10-01T06:00:01Z');
      await (notificationService as any)
        .updateNotificationTimestamps('user1', mockFormations, notifiedAt);
      
      expect(mockNotificationRepo.updateLastNotified)
        .toHaveBeenCalledWith('user1', 'Escalade', notifiedAt);
    });
  });
});
describe('summarizeNotificationResults', () => {
  const f = (reference: string) => makeFormation({ reference });

  it('compte les abonnés et les formations distincts, pas les paires abonné × formation', () => {
    const results = [
      { formation: f('A'), usersNotified: 1, errors: [], userId: 'u1' },
      { formation: f('B'), usersNotified: 1, errors: [], userId: 'u1' },
      { formation: f('A'), usersNotified: 1, errors: [], userId: 'u2' },
      { formation: f('C'), usersNotified: 0, errors: [{ userId: 'u3', error: 'SMTP' }] },
      { formation: f('D'), usersNotified: 0, errors: [{ userId: 'u3', error: 'SMTP' }] },
    ];

    expect(summarizeNotificationResults(results)).toEqual({ usersNotified: 2, formationsSent: 2, usersInError: 1 });
  });
});
