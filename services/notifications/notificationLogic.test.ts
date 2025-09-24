import { describe, it, expect } from 'vitest';
import {
  filterTodaysFormations,
  shouldNotifyBasedOnTime,
  groupFormationsByUser,
  extractUniqueDisciplines,
  getStartOfDay,
  UserFormationData
} from './notificationLogic';
import { Formation } from '@/types/formation';

describe('notificationLogic', () => {
  describe('filterTodaysFormations', () => {
    it('should filter formations for today and specific discipline', () => {
      const today = new Date('2024-01-15T10:00:00');
      const formations: Formation[] = [
        {
          reference: 'REF1',
          titre: 'Formation 1',
          discipline: 'Alpinisme',
          firstSeenAt: '2024-01-15T08:00:00',
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
          titre: 'Formation 2',
          discipline: 'Alpinisme',
          firstSeenAt: '2024-01-14T08:00:00', // Hier
          dates: [],
          lieu: 'Annecy',
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
          reference: 'REF3',
          titre: 'Formation 3',
          discipline: 'Escalade', // Autre discipline
          firstSeenAt: '2024-01-15T08:00:00',
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
        },
      ];

      const result = filterTodaysFormations(formations, 'Alpinisme', today);

      expect(result).toHaveLength(1);
      expect(result[0].reference).toBe('REF1');
    });

    it('should return empty array when no formations match', () => {
      const today = new Date('2024-01-15T10:00:00');
      const formations: Formation[] = [];

      const result = filterTodaysFormations(formations, 'Alpinisme', today);

      expect(result).toHaveLength(0);
    });
  });

  describe('shouldNotifyBasedOnTime', () => {
    it('should return true when no last notification date', () => {
      const now = new Date('2024-01-15T10:00:00');

      expect(shouldNotifyBasedOnTime(null, now)).toBe(true);
      expect(shouldNotifyBasedOnTime(undefined, now)).toBe(true);
    });

    it('should return true when more than 24 hours have passed', () => {
      const lastNotified = new Date('2024-01-14T09:00:00');
      const now = new Date('2024-01-15T10:00:00'); // 25 hours later

      expect(shouldNotifyBasedOnTime(lastNotified, now)).toBe(true);
    });

    it('should return false when less than 24 hours have passed', () => {
      const lastNotified = new Date('2024-01-15T09:00:00');
      const now = new Date('2024-01-15T10:00:00'); // 1 hour later

      expect(shouldNotifyBasedOnTime(lastNotified, now)).toBe(false);
    });

    it('should return false when exactly 24 hours have passed', () => {
      const lastNotified = new Date('2024-01-14T10:00:00');
      const now = new Date('2024-01-15T10:00:00'); // Exactly 24 hours later

      expect(shouldNotifyBasedOnTime(lastNotified, now)).toBe(false);
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

  describe('getStartOfDay', () => {
    it('should reset time to start of day', () => {
      const date = new Date('2024-01-15T14:30:45.123');
      const result = getStartOfDay(date);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should not modify the original date', () => {
      const originalDate = new Date('2024-01-15T14:30:45.123');
      const originalTime = originalDate.getTime();

      getStartOfDay(originalDate);

      expect(originalDate.getTime()).toBe(originalTime);
    });
  });
});