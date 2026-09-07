import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormationRepository } from './FormationRepository';
import { prisma } from '@/lib/prisma';
import { formationSchema } from '@/types/formation';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    formations: { findMany: vi.fn() },
  },
}));

// Ligne Prisma complète : colonnes brutes + tables jointes.
const prismaRow = {
  id: 42,
  reference: 'REF123',
  titre: 'Formation Test',
  discipline_id: 7,
  information_stagiaire: 'Info stagiaire',
  nombre_participants: 10,
  places_restantes: 5,
  hebergement_id: 3,
  tarif: 1000,
  lieu_id: 9,
  organisateur: 'Org Test',
  responsable: 'Responsable Test',
  email_contact: 'contact@example.org',
  first_seen_at: new Date('2024-01-01T00:00:00.000Z'),
  last_seen_at: new Date('2024-01-02T00:00:00.000Z'),
  status: 'active',
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-02T00:00:00.000Z'),
  disciplines: { id: 7, nom: 'Escalade', created_at: null, updated_at: null },
  lieux: { id: 9, nom: 'Paris', created_at: null, updated_at: null },
  types_hebergement: { id: 3, nom: 'Gîte', created_at: null, updated_at: null },
  formations_dates: [{ id: 1, formation_id: 42, date_debut: new Date('2024-05-01T00:00:00.000Z') }],
  formations_documents: [{ id: 1, formation_id: 42, type: 'inscription', nom: 'Fiche', url: 'https://example.org/f.pdf' }],
};

describe('FormationRepository - projection des formations', () => {
  let repository: FormationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new FormationRepository();
    vi.mocked(prisma.formations.findMany).mockResolvedValue([prismaRow] as never);
  });

  it("n'expose que les champs du type Formation", async () => {
    const [formation] = await repository.findAllFormations();

    expect(Object.keys(formation).sort()).toEqual(Object.keys(formationSchema.shape).sort());
    expect(formationSchema.parse(formation)).toBeTruthy();
  });

  // Le spread de la ligne Prisma doublait le poids du payload, ce qui faisait
  // passer le cache de /api/formations au-dessus de la limite de 2 Mo de Next.
  it('ne laisse fuiter ni colonnes brutes ni tables jointes', async () => {
    const [formation] = await repository.findAllFormations();

    for (const leaked of [
      'id', 'status', 'created_at', 'updated_at', 'discipline_id', 'lieu_id',
      'hebergement_id', 'information_stagiaire', 'email_contact', 'first_seen_at',
      'last_seen_at', 'disciplines', 'lieux', 'types_hebergement',
      'formations_dates', 'formations_documents',
    ]) {
      expect(formation).not.toHaveProperty(leaked);
    }
  });

  it('mappe les valeurs jointes vers les champs attendus', async () => {
    const [formation] = await repository.findAllFormations();

    expect(formation).toMatchObject({
      reference: 'REF123',
      discipline: 'Escalade',
      lieu: 'Paris',
      hebergement: 'Gîte',
      informationStagiaire: 'Info stagiaire',
      dates: ['2024-05-01T00:00:00.000Z'],
      documents: [{ type: 'inscription', nom: 'Fiche', url: 'https://example.org/f.pdf' }],
    });
  });
});
