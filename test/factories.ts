import type { Formation } from '@/types/formation';

/** Formation complète et typée : les tests n'écrasent que les champs qu'ils vérifient. */
export function makeFormation(overrides: Partial<Formation> = {}): Formation {
  return {
    reference: 'REF-001',
    titre: 'Formation test',
    dates: ['2024-05-01', '2024-05-02'],
    lieu: 'Paris',
    informationStagiaire: 'Informations stagiaire',
    nombreParticipants: 12,
    placesRestantes: 5,
    hebergement: 'Gîte',
    tarif: 500,
    discipline: 'Alpinisme',
    organisateur: 'Club test',
    responsable: 'Responsable test',
    emailContact: 'contact@example.org',
    documents: [],
    firstSeenAt: '2024-04-01T00:00:00.000Z',
    lastSeenAt: '2024-04-02T00:00:00.000Z',
    ...overrides,
  };
}
