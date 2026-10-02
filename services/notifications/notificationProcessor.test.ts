import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProcessor } from './notificationProcessor.service';
import { Formation } from '@/types/formation';
import { makeFormation } from '@/test/factories';

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

    it('ne renvoie pas une formation apparue avant le dernier email', async () => {
      const formations: Formation[] = [
        {
          reference: 'REF1',
          titre: 'Formation Alpinisme',
          discipline: 'Alpinisme',
          firstSeenAt: new Date(fixedDate.getTime() - 3 * 60 * 60 * 1000).toISOString(), // apparue 1h avant le dernier email
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

      // User1 a reçu un email il y a 2 heures, après l'apparition de la formation
      const twoHoursAgo = new Date(fixedDate);
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
      mockNotificationRepo.getLastNotification.mockResolvedValue({
        last_notified_at: twoHoursAgo
      });

      const result = await processor.processFormations(formations);

      // Rien de nouveau depuis son dernier email
      expect(result.size).toBe(0);
    });

    it("premier email : n'envoie pas une formation apparue il y a plus de 24h", async () => {
      const formations = [makeFormation({
        reference: 'IL_Y_A_48H',
        discipline: 'Alpinisme',
        firstSeenAt: new Date(fixedDate.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      })];
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'user1', email: 'user1@test.com' }
      ]);
      mockNotificationRepo.getLastNotification.mockResolvedValue(null);

      const result = await processor.processFormations(formations);

      expect(result.size).toBe(0);
    });

    it("n'interroge pas les abonnés quand aucune formation n'est apparue dans les 72h", async () => {
      const formations = [makeFormation({
        reference: 'IL_Y_A_4_JOURS',
        discipline: 'Alpinisme',
        firstSeenAt: new Date(fixedDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      })];

      const result = await processor.processFormations(formations);

      expect(result.size).toBe(0);
      expect(mockUserService.getUsersToNotifyForDiscipline).not.toHaveBeenCalled();
    });

    it('should notify for a formation first seen within 24h on the previous calendar day', async () => {
      // Régression: sync hors créneau (la veille au soir). La formation est < 24h
      // au moment du run mais sur un jour calendaire différent -> doit être notifiée.
      const yesterdayEvening = new Date(fixedDate);
      yesterdayEvening.setHours(yesterdayEvening.getHours() - 16); // ~16h avant, jour précédent

      const formations: Formation[] = [
        {
          reference: 'VELO1',
          titre: 'Vélo de montagne',
          discipline: 'Vélo-de-montagne',
          firstSeenAt: yesterdayEvening.toISOString(),
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

      expect(result.size).toBe(1);
      expect(result.get('user1')?.formations).toHaveLength(1);
      expect(result.get('user1')?.formations[0].reference).toBe('VELO1');
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

  describe('formations parues depuis le dernier email', () => {
    // Cas réel du 01/10/2026 : email envoyé la veille vers 06:01, sync à 04:00, cron à 06:00
    const emailDeLaVeille = new Date('2026-09-30T06:01:14Z');
    const dejaEnvoyee = makeFormation({ reference: 'DEJA', discipline: 'Cartographie Orientation', firstSeenAt: '2026-09-30T04:00:34Z' });
    const nouvelle = makeFormation({ reference: 'NOUVELLE', discipline: 'Cartographie Orientation', firstSeenAt: '2026-10-01T04:00:34Z' });

    const processorAt = (now: string) =>
      new NotificationProcessor(mockNotificationRepo, mockUserService, () => new Date(now));

    beforeEach(() => {
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'abonne', email: 'abonne@test.com', regions: [] },
      ]);
      mockNotificationRepo.getLastNotification.mockResolvedValue({ last_notified_at: emailDeLaVeille });
    });

    it('notifie le lendemain un abonné qui a reçu un email la veille, sans renvoyer les formations déjà envoyées', async () => {
      const result = await processorAt('2026-10-01T06:00:01Z').processFormations([dejaEnvoyee, nouvelle]);

      expect(result.get('abonne')?.formations.map(f => f.reference)).toEqual(['NOUVELLE']);
    });

    it("rattrape le surlendemain une formation qui n'a pas pu être envoyée (run sauté, envoi en échec)", async () => {
      const result = await processorAt('2026-10-02T06:00:01Z').processFormations([nouvelle]);

      expect(result.get('abonne')?.formations.map(f => f.reference)).toEqual(['NOUVELLE']);
    });

    it("ne remonte pas au-delà de 72h, même si le dernier email est plus ancien", async () => {
      mockNotificationRepo.getLastNotification.mockResolvedValue({ last_notified_at: new Date('2026-08-01T06:00:00Z') });
      const ilYa2Jours = makeFormation({ reference: 'IL_Y_A_2_JOURS', discipline: 'Cartographie Orientation', firstSeenAt: '2026-09-29T04:00:00Z' });
      const ilYa5Jours = makeFormation({ reference: 'IL_Y_A_5_JOURS', discipline: 'Cartographie Orientation', firstSeenAt: '2026-09-26T04:00:00Z' });

      const result = await processorAt('2026-10-01T06:00:00Z').processFormations([ilYa5Jours, ilYa2Jours]);

      expect(result.get('abonne')?.formations.map(f => f.reference)).toEqual(['IL_Y_A_2_JOURS']);
    });
  });

  describe('filtre par comité régional organisateur', () => {
    const recent = (reference: string) =>
      makeFormation({ reference, discipline: 'Alpinisme', firstSeenAt: fixedDate.toISOString() });

    beforeEach(() => {
      mockNotificationRepo.getLastNotification.mockResolvedValue(null);
    });

    it('ne garde que les formations des comités choisis par l’utilisateur', async () => {
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'aura', email: 'aura@test.com', regions: ['84'] },
        { userId: 'tous', email: 'tous@test.com', regions: [] },
      ]);

      const result = await processor.processFormations([
        recent('2027FCCOPPE84712'),
        recent('2027FCCOPIN75706'),
      ]);

      expect(result.get('aura')?.formations.map(f => f.reference)).toEqual(['2027FCCOPPE84712']);
      expect(result.get('tous')?.formations).toHaveLength(2);
    });

    it('ne notifie pas un utilisateur dont aucun comité ne correspond', async () => {
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'bretagne', email: 'bzh@test.com', regions: ['53'] },
      ]);

      const result = await processor.processFormations([recent('2027FCCOPPE84712')]);

      expect(result.size).toBe(0);
      // Pas de lecture du dernier email quand aucun comité ne correspond
      expect(mockNotificationRepo.getLastNotification).not.toHaveBeenCalled();
    });

    it('traite une absence de régions comme « tous les comités »', async () => {
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'ancien', email: 'ancien@test.com' },
      ]);

      const result = await processor.processFormations([recent('2027FCCOPPE84712')]);

      expect(result.get('ancien')?.formations).toHaveLength(1);
    });
  });

  describe('filtre par niveau de stage', () => {
    const recent = (reference: string) =>
      makeFormation({ reference, discipline: 'Ski alpinisme', firstSeenAt: fixedDate.toISOString() });

    beforeEach(() => {
      mockNotificationRepo.getLastNotification.mockResolvedValue(null);
    });

    it('ne garde que les niveaux choisis par l’utilisateur (cas de l’issue #31)', async () => {
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'certif', email: 'certif@test.com', niveaux: ['initiateur-1-certification'] },
        { userId: 'tous', email: 'tous@test.com', niveaux: [] },
      ]);

      const result = await processor.processFormations([
        recent('2027SNSMINT84701'), // certification initiateur 1er degré
        recent('2027SNSMRIN84701'), // recyclage
        recent('2027SNSMIQT84701'), // certification 2e degré
      ]);

      expect(result.get('certif')?.formations.map(f => f.reference)).toEqual(['2027SNSMINT84701']);
      expect(result.get('tous')?.formations).toHaveLength(3);
    });

    it('ne notifie pas un utilisateur dont aucun niveau ne correspond', async () => {
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'recyclage', email: 'r@test.com', niveaux: ['recyclage'] },
      ]);

      const result = await processor.processFormations([recent('2027SNSMINT84701')]);

      expect(result.size).toBe(0);
      expect(mockNotificationRepo.getLastNotification).not.toHaveBeenCalled();
    });

    it('traite une absence de niveaux comme « tous les niveaux »', async () => {
      mockUserService.getUsersToNotifyForDiscipline.mockResolvedValue([
        { userId: 'ancien', email: 'ancien@test.com' },
      ]);

      const result = await processor.processFormations([recent('2027SNSMINT84701')]);

      expect(result.get('ancien')?.formations).toHaveLength(1);
    });
  });
});
