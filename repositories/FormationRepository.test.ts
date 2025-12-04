import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

// Mock Prisma
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
        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock responses
        vi.mocked(prisma.disciplines.findMany).mockResolvedValue([]);
        vi.mocked(prisma.lieux.findMany).mockResolvedValue([]);
        vi.mocked(prisma.types_hebergement.findMany).mockResolvedValue([]);
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

    describe('upsertFormations (batch)', () => {
        const setupUpsertMocks = () => {
            // Mock preloadRelations - disciplines, lieux, hebergements
            vi.mocked(prisma.disciplines.findMany).mockResolvedValue([
                { id: 1, nom: 'Informatique', created_at: null, updated_at: null }
            ]);
            vi.mocked(prisma.lieux.findMany).mockResolvedValue([
                { id: 1, nom: 'Paris', departement: null, created_at: null, updated_at: null }
            ]);
            vi.mocked(prisma.types_hebergement.findMany).mockResolvedValue([
                { id: 1, nom: 'Hotel', created_at: null, updated_at: null }
            ]);

            // Mock transaction - execute callback with prisma as tx
            vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
                return callback(prisma);
            });

            // Mock upsert to return formation with id
            vi.mocked(prisma.formations.upsert).mockImplementation(async (args: any) => ({
                id: args.where.reference === 'REF123' ? 1 : 2,
                reference: args.where.reference
            } as any));

            // Mock delete and create for dates/documents
            vi.mocked(prisma.formations_dates.deleteMany).mockResolvedValue({ count: 0 });
            vi.mocked(prisma.formations_documents.deleteMany).mockResolvedValue({ count: 0 });
            vi.mocked(prisma.formations_dates.createMany).mockResolvedValue({ count: 1 });
            vi.mocked(prisma.formations_documents.createMany).mockResolvedValue({ count: 1 });
        };

        it('should handle batch upsert of multiple formations', async () => {
            setupUpsertMocks();

            const formations: Formation[] = [
                mockFormation,
                {
                    ...mockFormation,
                    reference: 'REF002',
                    titre: 'Formation 2'
                }
            ];

            await repository.upsertFormations(formations);

            // Vérifier que upsert a été appelé pour chaque formation
            expect(prisma.formations.upsert).toHaveBeenCalledTimes(2);
            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('should handle empty batch gracefully', async () => {
            // Empty batch should still call preloadRelations but not process any formations
            vi.mocked(prisma.disciplines.findMany).mockResolvedValue([]);
            vi.mocked(prisma.lieux.findMany).mockResolvedValue([]);
            vi.mocked(prisma.types_hebergement.findMany).mockResolvedValue([]);

            await repository.upsertFormations([]);

            // preloadRelations is called but no formations processed
            expect(prisma.disciplines.findMany).toHaveBeenCalled();
            expect(prisma.formations.upsert).not.toHaveBeenCalled();
        });

        it('should rollback on batch failure', async () => {
            setupUpsertMocks();

            // Override transaction to reject
            vi.mocked(prisma.$transaction).mockRejectedValueOnce(new Error('Transaction failed'));

            await expect(repository.upsertFormations([mockFormation]))
                .rejects.toThrow('Transaction failed');
        });
    });

    describe('upsertFormation', () => {
        it('should successfully upsert a single formation', async () => {
            // Mock preloadRelations
            vi.mocked(prisma.disciplines.findMany).mockResolvedValue([
                { id: 1, nom: mockFormation.discipline, created_at: null, updated_at: null }
            ]);
            vi.mocked(prisma.lieux.findMany).mockResolvedValue([
                { id: 1, nom: mockFormation.lieu, departement: null, created_at: null, updated_at: null }
            ]);
            vi.mocked(prisma.types_hebergement.findMany).mockResolvedValue([
                { id: 1, nom: mockFormation.hebergement, created_at: null, updated_at: null }
            ]);

            // Mock transaction
            vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
                return callback(prisma);
            });

            vi.mocked(prisma.formations.upsert).mockResolvedValue({
                id: 1,
                reference: mockFormation.reference
            } as any);

            vi.mocked(prisma.formations_dates.deleteMany).mockResolvedValue({ count: 0 });
            vi.mocked(prisma.formations_documents.deleteMany).mockResolvedValue({ count: 0 });
            vi.mocked(prisma.formations_dates.createMany).mockResolvedValue({ count: 1 });
            vi.mocked(prisma.formations_documents.createMany).mockResolvedValue({ count: 1 });

            await repository.upsertFormation(mockFormation);

            expect(prisma.formations.upsert).toHaveBeenCalled();
            expect(prisma.formations_dates.deleteMany).toHaveBeenCalled();
            expect(prisma.formations_documents.deleteMany).toHaveBeenCalled();
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