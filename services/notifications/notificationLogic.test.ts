import { describe, it, expect } from 'vitest';
import {
  filterFormationsSince,
  getNotifiableSince,
  groupFormationsByUser,
  extractUniqueDisciplines,
  UserFormationData
} from './notificationLogic';
import { Formation } from '@/types/formation';
import { makeFormation } from '@/test/factories';

describe('notificationLogic', () => {
  describe('getNotifiableSince', () => {
    const now = new Date('2026-10-01T06:00:01Z');

    it("part des dernières 24h pour un premier email", () => {
      expect(getNotifiableSince(null, now)).toEqual(new Date('2026-09-30T06:00:01Z'));
      expect(getNotifiableSince(undefined, now)).toEqual(new Date('2026-09-30T06:00:01Z'));
    });

    it("part du dernier email, même s'il date de moins de 24h", () => {
      const emailDeLaVeille = new Date('2026-09-30T06:01:14Z');

      expect(getNotifiableSince(emailDeLaVeille, now)).toEqual(emailDeLaVeille);
    });

    it("jamais notifié : part de la date d'abonnement si elle a plus de 24h", () => {
      // Abonné il y a 2 jours sans email : formations parues depuis son abonnement
      expect(getNotifiableSince(null, now, new Date('2026-09-29T10:00:00Z'))).toEqual(new Date('2026-09-29T10:00:00Z'));
    });

    it('jamais notifié et abonné depuis moins de 24h : dernières 24h', () => {
      expect(getNotifiableSince(null, now, new Date('2026-10-01T05:50:00Z'))).toEqual(new Date('2026-09-30T06:00:01Z'));
    });

    it('jamais notifié et abonné depuis longtemps : pas plus de 72h', () => {
      expect(getNotifiableSince(null, now, new Date('2025-01-01T00:00:00Z'))).toEqual(new Date('2026-09-28T06:00:01Z'));
    });

    it('ne remonte jamais au-delà de 72h', () => {
      expect(getNotifiableSince(new Date('2026-08-01T06:00:00Z'), now)).toEqual(new Date('2026-09-28T06:00:01Z'));
    });
  });

  describe('filterFormationsSince', () => {
    const since = new Date('2026-09-30T06:01:14Z');

    it('garde les formations de la discipline apparues strictement après la date', () => {
      const formations = [
        makeFormation({ reference: 'AVANT', discipline: 'Alpinisme', firstSeenAt: '2026-09-30T04:00:00Z' }),
        makeFormation({ reference: 'PILE', discipline: 'Alpinisme', firstSeenAt: '2026-09-30T06:01:14Z' }),
        makeFormation({ reference: 'APRES', discipline: 'Alpinisme', firstSeenAt: '2026-10-01T04:00:00Z' }),
        makeFormation({ reference: 'AUTRE_DISCIPLINE', discipline: 'Escalade', firstSeenAt: '2026-10-01T04:00:00Z' }),
        makeFormation({ reference: 'SANS_DATE', discipline: 'Alpinisme', firstSeenAt: '' }),
      ];

      expect(filterFormationsSince(formations, 'Alpinisme', since).map(f => f.reference)).toEqual(['APRES']);
    });

    it('garde, pour un premier email, une formation captée la veille au soir', () => {
      // Régression : sync hors créneau (17h58 la veille), run de 06h00 le lendemain
      const now = new Date('2024-01-15T06:00:00Z');
      const formations = [makeFormation({ reference: 'VELO1', discipline: 'Vélo-de-montagne', firstSeenAt: '2024-01-14T17:58:00Z' })];

      const result = filterFormationsSince(formations, 'Vélo-de-montagne', getNotifiableSince(null, now));

      expect(result.map(f => f.reference)).toEqual(['VELO1']);
    });
  });

  describe('groupFormationsByUser', () => {
    it('should group formations by user correctly', () => {
      const userFormations: UserFormationData[] = [
        {
          userId: 'user1',
          email: 'user1@test.com',
          formations: [
            {
              reference: 'REF1',
              titre: 'Formation 1',
              discipline: 'Alpinisme',
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
              firstSeenAt: '',
              lastSeenAt: ''
            }
          ]
        },
        {
          userId: 'user1',
          email: 'user1@test.com',
          formations: [
            {
              reference: 'REF2',
              titre: 'Formation 2',
              discipline: 'Escalade',
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
              firstSeenAt: '',
              lastSeenAt: ''
            }
          ]
        },
        {
          userId: 'user2',
          email: 'user2@test.com',
          formations: [
            {
              reference: 'REF3',
              titre: 'Formation 3',
              discipline: 'Ski',
              dates: [],
              lieu: 'Grenoble',
              informationStagiaire: '',
              nombreParticipants: 10,
              placesRestantes: 5,
              hebergement: '',
              tarif: 100,
              organisateur: '',
              responsable: '',
              emailContact: '',
              documents: [],
              firstSeenAt: '',
              lastSeenAt: ''
            }
          ]
        }
      ];

      const result = groupFormationsByUser(userFormations);

      expect(result.size).toBe(2);
      expect(result.get('user1')).toBeDefined();
      expect(result.get('user1')?.formations).toHaveLength(2);
      expect(result.get('user1')?.email).toBe('user1@test.com');
      expect(result.get('user2')).toBeDefined();
      expect(result.get('user2')?.formations).toHaveLength(1);
    });

    it('should handle empty input', () => {
      const result = groupFormationsByUser([]);

      expect(result.size).toBe(0);
    });
  });

  describe('extractUniqueDisciplines', () => {
    it('should extract unique disciplines from formations', () => {
      const formations: Formation[] = [
        {
          reference: 'REF1',
          titre: 'Formation 1',
          discipline: 'Alpinisme',
          dates: [],
          lieu: '',
          informationStagiaire: '',
          nombreParticipants: 0,
          placesRestantes: null,
          hebergement: '',
          tarif: 0,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          firstSeenAt: '',
          lastSeenAt: ''
        },
        {
          reference: 'REF2',
          titre: 'Formation 2',
          discipline: 'Alpinisme',
          dates: [],
          lieu: '',
          informationStagiaire: '',
          nombreParticipants: 0,
          placesRestantes: null,
          hebergement: '',
          tarif: 0,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          firstSeenAt: '',
          lastSeenAt: ''
        },
        {
          reference: 'REF3',
          titre: 'Formation 3',
          discipline: 'Escalade',
          dates: [],
          lieu: '',
          informationStagiaire: '',
          nombreParticipants: 0,
          placesRestantes: null,
          hebergement: '',
          tarif: 0,
          organisateur: '',
          responsable: '',
          emailContact: '',
          documents: [],
          firstSeenAt: '',
          lastSeenAt: ''
        },
      ];

      const result = extractUniqueDisciplines(formations);

      expect(result).toHaveLength(2);
      expect(result).toContain('Alpinisme');
      expect(result).toContain('Escalade');
    });
  });

});