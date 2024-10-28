// utils/__tests__/stats.test.ts
import { describe, expect, it } from 'vitest';
import { generateStats } from './stats';
import type { Formation } from '@/types/formation';

describe('generateStats', () => {
  // Données de test
  const mockFormations: Formation[] = [
    {
      reference: "F1",
      titre: "Formation 1",
      dates: ["01/01/2024", "02/01/2024"],
      lieu: "Lyon",
      discipline: "Escalade",
      tarif: 100,
      nombreParticipants: 10,
      placesRestantes: 5,
      hebergement: "Gite",
      organisateur: "CAF",
      responsable: "John Doe",
      informationStagiaire: "Info",
      emailContact: "test@test.com",
      firstSeenAt: "2024-01-01",
      documents: []
    },
    {
      reference: "F2",
      titre: "Formation 2",
      dates: ["03/01/2024"],
      lieu: "Lyon",
      discipline: "Escalade",
      tarif: 200,
      nombreParticipants: 8,
      placesRestantes: 3,
      hebergement: "Refuge",
      organisateur: "CAF",
      responsable: "Jane Doe",
      informationStagiaire: "Info",
      emailContact: "test@test.com",
      firstSeenAt: "2024-01-01",
      documents: []
    },
    {
      reference: "F3",
      titre: "Formation 3",
      dates: ["05/01/2024", "06/01/2024"],
      lieu: "Paris",
      discipline: "Alpinisme",
      tarif: 0, // Formation gratuite
      nombreParticipants: 12,
      placesRestantes: 6,
      hebergement: "Refuge",
      organisateur: "CAF",
      responsable: "Jim Doe",
      informationStagiaire: "Info",
      emailContact: "test@test.com",
      firstSeenAt: "2024-01-01",
      documents: []
    }
  ];

  it('should calculate correct total number of formations', () => {
    const stats = generateStats(mockFormations);
    expect(stats.total).toBe(3);
  });

  it('should calculate correct number of unique disciplines', () => {
    const stats = generateStats(mockFormations);
    expect(stats.uniqueDisciplines).toBe(2); // Escalade, Alpinisme
  });

  it('should calculate correct number of unique locations', () => {
    const stats = generateStats(mockFormations);
    expect(stats.uniqueLocations).toBe(2); // Lyon, Paris
  });

  it('should calculate correct average price for formations with price', () => {
    const stats = generateStats(mockFormations);
    expect(stats.averagePrice).toBe(150); // (100 + 200) / 2
  });

  it('should count correct number of priced formations', () => {
    const stats = generateStats(mockFormations);
    expect(stats.pricedFormations).toBe(2);
  });

  it('should generate correct discipline distribution', () => {
    const stats = generateStats(mockFormations);
    expect(stats.disciplines).toEqual({
      'Escalade': 2,
      'Alpinisme': 1
    });
  });

  it('should calculate correct date range', () => {
    const stats = generateStats(mockFormations);
    expect(stats.dateRange.start).toEqual(new Date('2024-01-01'));
    expect(stats.dateRange.end).toEqual(new Date('2024-01-06'));
  });

  // Tests pour les cas limites
  it('should handle empty formations array', () => {
    const stats = generateStats([]);
    expect(stats).toEqual({
      total: 0,
      uniqueDisciplines: 0,
      uniqueLocations: 0,
      averagePrice: 0,
      pricedFormations: 0,
      disciplines: {},
      dateRange: {
        start: expect.any(Date),
        end: expect.any(Date)
      }
    });
  });

  it('should handle formations with all free prices', () => {
    const freeFormations = mockFormations.map(f => ({ ...f, tarif: 0 }));
    const stats = generateStats(freeFormations);
    expect(stats.averagePrice).toBe(0);
    expect(stats.pricedFormations).toBe(0);
  });

  it('should handle formations with single date', () => {
    const singleDateFormations = mockFormations.map(f => ({ 
      ...f, 
      dates: ['01/01/2024'] 
    }));
    const stats = generateStats(singleDateFormations);
    expect(stats.dateRange.start).toEqual(stats.dateRange.end);
  });

  // Test pour la fonction calculateDateRange séparément
  describe('calculateDateRange', () => {
    it('should handle formations with multiple dates correctly', () => {
      const formationsWithDates: Formation[] = [
        { ...mockFormations[0], dates: ['01/01/2024', '05/01/2024'] },
        { ...mockFormations[1], dates: ['02/01/2024', '03/01/2024'] }
      ];
      const stats = generateStats(formationsWithDates);
      expect(stats.dateRange.start).toEqual(new Date('2024-01-01'));
      expect(stats.dateRange.end).toEqual(new Date('2024-01-05'));
    });

    it('should handle invalid dates gracefully', () => {
      const formationsWithInvalidDates: Formation[] = [
        { ...mockFormations[0], dates: ['invalid date'] }
      ];
      expect(() => generateStats(formationsWithInvalidDates)).not.toThrow();
    });
  });
});