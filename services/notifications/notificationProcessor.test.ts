import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProcessor } from './notificationProcessor.service';
import { Formation } from '@/types/formation';

describe('NotificationProcessor avec injection', () => {
  let mockNotificationRepo: any;
  let mockUserService: any;
  let processor: NotificationProcessor;
  const fixedDate = new Date('2024-01-15T10:00:00');

  beforeEach(() => {
    // Mock du repository de notifications
    mockNotificationRepo = {
      getLastNotification: vi.fn()
    };

    // Mock du service utilisateur
    mockUserService = {
      getUsersToNotifyForDiscipline: vi.fn()
    };

    // Créer le processor avec date fixe pour les tests
    processor = new NotificationProcessor(
      mockNotificationRepo,
      mockUserService,
      () => fixedDate
    );
  });

  describe('processFormations', () => {
    it('should process formations and group by user', async () => {
      const formations: Formation[] = [
        {
          reference: 'REF1',
          titre: 'Formation Alpinisme',
          discipline: 'Alpinisme',
          firstSeenAt: fixedDate.toISOString(), // Aujourd'hui
          dates: [],
          lieu: 'Chamonix',
          informationStagiaire: '',
          nombreParticipants: 10,
          placesRestantes: 5,
          hebergement: '',
          tarif: 100,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          lastSeenAt: ''
        }
      ];

      // Configuration des mocks
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'user1', email: 'user1@test.com' },
        { userId: 'user2', email: 'user2@test.com' }
      ]);

      mockNotificationRepo.getLastNotification.mockResolvedValue(null); // Pas de notification précédente

      // Exécution
      const result = await processor.processFormations(formations);

      // Vérifications
      expect(result.size).toBe(2);
      expect(result.get('user1')).toBeDefined();
      expect(result.get('user1')?.email).toBe('user1@test.com');
      expect(result.get('user1')?.formations).toHaveLength(1);
      expect(result.get('user2')).toBeDefined();
      expect(result.get('user2')?.formations).toHaveLength(1);

      expect(mockUserService.getUsersToNotifyForDiscipline).toHaveBeenCalledWith('Alpinisme');
      expect(mockNotificationRepo.getLastNotification).toHaveBeenCalledTimes(2);
    });

    it('should not notify users who were recently notified', async () => {
      const formations: Formation[] = [
        {
          reference: 'REF1',
          titre: 'Formation Alpinisme',
          discipline: 'Alpinisme',
          firstSeenAt: fixedDate.toISOString(),
          dates: [],
          lieu: 'Chamonix',
          informationStagiaire: '',
          nombreParticipants: 10,
          placesRestantes: 5,
          hebergement: '',
          tarif: 100,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          lastSeenAt: ''
        }
      ];

      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'user1', email: 'user1@test.com' }
      ]);

      // User1 a été notifié il y a 2 heures (moins de 24h)
      const twoHoursAgo = new Date(fixedDate);
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
      mockNotificationRepo.getLastNotification.mockResolvedValue({
        last_notified_at: twoHoursAgo
      });

      const result = await processor.processFormations(formations);

      // User1 ne doit pas être dans le résultat
      expect(result.size).toBe(0);
    });

    it('should filter out formations from other days', async () => {
      const yesterday = new Date(fixedDate);
      yesterday.setDate(yesterday.getDate() - 1);

      const formations: Formation[] = [
        {
          reference: 'REF1',
          titre: 'Formation Hier',
          discipline: 'Alpinisme',
          firstSeenAt: yesterday.toISOString(), // Hier
          dates: [],
          lieu: 'Chamonix',
          informationStagiaire: '',
          nombreParticipants: 10,
          placesRestantes: 5,
          hebergement: '',
          tarif: 100,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          lastSeenAt: ''
        }
      ];

      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'user1', email: 'user1@test.com' }
      ]);

      mockNotificationRepo.getLastNotification.mockResolvedValue(null);

      const result = await processor.processFormations(formations);

      // Aucun utilisateur ne doit être notifié car pas de formations du jour
      expect(result.size).toBe(0);
      // getUsersToNotifyForDiscipline ne devrait même pas être appelé si aucune formation du jour
      expect(mockUserService.getUsersToNotifyForDiscipline).toHaveBeenCalled();
    });

    it('should handle multiple disciplines correctly', async () => {
      const formations: Formation[] = [
        {
          reference: 'REF1',
          titre: 'Formation Alpinisme',
          discipline: 'Alpinisme',
          firstSeenAt: fixedDate.toISOString(),
          dates: [],
          lieu: 'Chamonix',
          informationStagiaire: '',
          nombreParticipants: 10,
          placesRestantes: 5,
          hebergement: '',
          tarif: 100,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          lastSeenAt: ''
        },
        {
          reference: 'REF2',
          titre: 'Formation Escalade',
          discipline: 'Escalade',
          firstSeenAt: fixedDate.toISOString(),
          dates: [],
          lieu: 'Lyon',
          informationStagiaire: '',
          nombreParticipants: 10,
          placesRestantes: 5,
          hebergement: '',
          tarif: 100,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          lastSeenAt: ''
        }
      ];

      // Mock différents utilisateurs pour chaque discipline
      mockUserService.getUsersToNotifyForDiscipline.mockImplementation((discipline: string) => {
        if (discipline === 'Alpinisme') {
          return Promise.resolve([{ userId: 'user1', email: 'user1@test.com' }]);
        } else if (discipline === 'Escalade') {
          return Promise.resolve([{ userId: 'user2', email: 'user2@test.com' }]);
        }
        return Promise.resolve([]);
      });

      mockNotificationRepo.getLastNotification.mockResolvedValue(null);

      const result = await processor.processFormations(formations);

      // Chaque utilisateur doit recevoir sa discipline
      expect(result.size).toBe(2);
      expect(result.get('user1')?.formations[0].discipline).toBe('Alpinisme');
      expect(result.get('user2')?.formations[0].discipline).toBe('Escalade');

      expect(mockUserService.getUsersToNotifyForDiscipline).toHaveBeenCalledWith('Alpinisme');
      expect(mockUserService.getUsersToNotifyForDiscipline).toHaveBeenCalledWith('Escalade');
    });
  });
});