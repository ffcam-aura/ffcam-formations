import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormationRepository } from './FormationRepository';
import { prisma } from '@/lib/prisma';
import { Formation } from '@/types/formation';
import { Prisma } from '@prisma/client';

// Type pour les mocks Prisma
type FormationInclude = {
    disciplines: true;
    lieux: true;
    types_hebergement: true;
    formations_dates: {
        orderBy: {
            date_debut: 'asc'
        }
    };
    formations_documents: true;
};

type PrismaFormation = Prisma.formationsGetPayload<{ include: FormationInclude }>;

// Type pour le résultat d'agrégation
type AggregateResult = Prisma.GetFormationsAggregateType<{
    _max: {
        last_seen_at: true;
    };
}>;

vi.mock('@/lib/prisma', () => ({
    prisma: {
        $transaction: vi.fn((callback) => callback(prisma)),
        formations: {
            upsert: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            aggregate: vi.fn()
        },
        formations_dates: {
            deleteMany: vi.fn(),
            createMany: vi.fn()
        },
        formations_documents: {
            deleteMany: vi.fn(),
            createMany: vi.fn()
        },
        disciplines: {
            createMany: vi.fn(),
            findMany: vi.fn()
        },
        lieux: {
            createMany: vi.fn(),
            findMany: vi.fn()
        },
        types_hebergement: {
            createMany: vi.fn(),
            findMany: vi.fn()
        }
    }
}));

describe('FormationRepository', () => {
    let repository: FormationRepository;
    const mockFormation: Formation = {
        reference: 'REF123',
        titre: 'Formation Test',
        dates: ['2024-01-01T00:00:00.000Z'],
        lieu: 'Paris',
        discipline: 'Informatique',
        informationStagiaire: 'Info test',
        nombreParticipants: 10,
        placesRestantes: 5,
        hebergement: 'Hotel',
        tarif: 1000,
        organisateur: 'Org Test',
        responsable: 'Resp Test',
        emailContact: 'test@test.com',
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        documents: [{
            type: 'PDF',
            nom: 'Doc test',
            url: 'http://test.com'
        }]
    };

    beforeEach(() => {
        repository = new FormationRepository();
        vi.clearAllMocks();
    });

    describe('findFormationByReference', () => {
        it('should return null when formation is not found', async () => {
            vi.mocked(prisma.formations.findUnique).mockResolvedValue(null);

            const result = await repository.findFormationByReference('NOT_FOUND');
            expect(result).toBeNull();
        });

        it('should return formation when found', async () => {
            const mockPrismaFormation: PrismaFormation = {
                id: 1,
                reference: mockFormation.reference,
                titre: mockFormation.titre,
                formations_dates: [{
                    id: 1,
                    formation_id: 1,
                    date_debut: new Date(mockFormation.dates[0]),
                    date_fin: null,
                    created_at: null,
                    updated_at: null
                }],
                lieux: {
                    id: 1,
                    nom: mockFormation.lieu,
                    departement: null,
                    created_at: null,
                    updated_at: null
                },
                disciplines: {
                    id: 1,
                    nom: mockFormation.discipline,
                    created_at: null,
                    updated_at: null
                },
                information_stagiaire: mockFormation.informationStagiaire,
                nombre_participants: mockFormation.nombreParticipants,
                places_restantes: mockFormation.placesRestantes,
                types_hebergement: {
                    id: 1,
                    nom: mockFormation.hebergement,
                    created_at: null,
                    updated_at: null
                },
                tarif: new Prisma.Decimal(mockFormation.tarif.toString()),
                organisateur: mockFormation.organisateur,
                responsable: mockFormation.responsable,
                email_contact: mockFormation.emailContact,
                first_seen_at: new Date(),
                last_seen_at: new Date(),
                created_at: new Date(),
                updated_at: null,
                status: 'active',
                discipline_id: 1,
                lieu_id: 1,
                hebergement_id: 1,
                formations_documents: [{
                    id: 1,
                    formation_id: 1,
                    type: mockFormation.documents[0].type,
                    nom: mockFormation.documents[0].nom,
                    url: mockFormation.documents[0].url,
                    created_at: null,
                    updated_at: null
                }]
            };

            vi.mocked(prisma.formations.findUnique).mockResolvedValue(mockPrismaFormation);

            const result = await repository.findFormationByReference(mockFormation.reference);
            expect(result).toMatchObject({
                reference: mockFormation.reference,
                titre: mockFormation.titre,
                dates: mockFormation.dates,
                lieu: mockFormation.lieu
            });
        });
    });

    describe('upsertFormation', () => {
        it('should successfully upsert a single formation', async () => {
            // Mock the necessary database calls
            vi.mocked(prisma.disciplines.findMany).mockResolvedValue([{
                id: 1,
                nom: mockFormation.discipline,
                created_at: null,
                updated_at: null
            }]);
            
            vi.mocked(prisma.lieux.findMany).mockResolvedValue([{
                id: 1,
                nom: mockFormation.lieu,
                departement: null,
                created_at: null,
                updated_at: null
            }]);
            
            vi.mocked(prisma.types_hebergement.findMany).mockResolvedValue([{
                id: 1,
                nom: mockFormation.hebergement,
                created_at: null,
                updated_at: null
            }]);

            vi.mocked(prisma.formations.upsert).mockResolvedValue({
                id: 1,
                reference: mockFormation.reference,
                titre: mockFormation.titre,
                discipline_id: 1,
                information_stagiaire: mockFormation.informationStagiaire,
                nombre_participants: mockFormation.nombreParticipants,
                places_restantes: mockFormation.placesRestantes,
                hebergement_id: 1,
                tarif: new Prisma.Decimal(mockFormation.tarif.toString()),
                lieu_id: 1,
                organisateur: mockFormation.organisateur,
                responsable: mockFormation.responsable,
                email_contact: mockFormation.emailContact,
                status: 'active',
                created_at: new Date(),
                updated_at: null,
                first_seen_at: new Date(),
                last_seen_at: new Date()
            });

            await repository.upsertFormation(mockFormation);

            expect(prisma.formations.upsert).toHaveBeenCalled();
            expect(prisma.formations_dates.createMany).toHaveBeenCalled();
            expect(prisma.formations_documents.createMany).toHaveBeenCalled();
        });
    });

    describe('getLastSync', () => {
        it('should return the last sync date', async () => {
            const mockDate = new Date();
            const mockAggregateResult: AggregateResult = {
                _count: null,
                _avg: null,
                _sum: null,
                _min: null,
                _max: {
                    last_seen_at: mockDate
                }
            };

            vi.mocked(prisma.formations.aggregate).mockResolvedValue(mockAggregateResult);

            const result = await repository.getLastSync();
            expect(result).toEqual(mockDate);
        });

        it('should return null when no formations exist', async () => {
            const mockAggregateResult: AggregateResult = {
                _count: null,
                _avg: null,
                _sum: null,
                _min: null,
                _max: {
                    last_seen_at: null
                }
            };

            vi.mocked(prisma.formations.aggregate).mockResolvedValue(mockAggregateResult);

            const result = await repository.getLastSync();
            expect(result).toBeNull();
        });
    });
}); 