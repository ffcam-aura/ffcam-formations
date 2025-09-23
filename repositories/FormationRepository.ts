import { prisma } from "@/lib/prisma";
import { Formation } from "@/types/formation";
import { Prisma } from "@prisma/client";

type RelationType = 'disciplines' | 'lieux' | 'types_hebergement';
type CacheKey = 'disciplines' | 'lieux' | 'hebergements';

export interface IFormationRepository {
    upsertFormations(formations: Formation[]): Promise<void>;
    upsertFormation(formation: Formation): Promise<void>;
    findFormationByReference(reference: string): Promise<Formation | null>;
    findAllFormations(): Promise<Formation[]>;
    findAllDisciplines(): Promise<string[]>;
    findRecentFormations(hours: number): Promise<Formation[]>;
    getLastSync(): Promise<Date | null>;
}

export class FormationRepository implements IFormationRepository {
    private static readonly BATCH_SIZE = 100;

    private formationInclude = {
        disciplines: true,
        lieux: true,
        types_hebergement: true,
        formations_dates: {
            orderBy: {
                date_debut: 'asc'
            }
        },
        formations_documents: true
    } as const;

    private relationCache = {
        disciplines: new Map<string, number>(),
        lieux: new Map<string, number>(),
        hebergements: new Map<string, number>()
    };

    private async createMissingRelations(
        table: RelationType,
        allValues: Set<string>,
        existingRecords: { id: number; nom: string }[]
    ): Promise<void> {
        const existingNames = new Set(existingRecords.map(r => r.nom));
        const missingValues = Array.from(allValues).filter(v => !existingNames.has(v));

        if (missingValues.length === 0) return;

        // Créer les relations manquantes selon le type
        switch (table) {
            case 'disciplines':
                await prisma.disciplines.createMany({
                    data: missingValues.map(nom => ({ nom })),
                    skipDuplicates: true
                });
                break;
            case 'lieux':
                await prisma.lieux.createMany({
                    data: missingValues.map(nom => ({ nom })),
                    skipDuplicates: true
                });
                break;
            case 'types_hebergement':
                await prisma.types_hebergement.createMany({
                    data: missingValues.map(nom => ({ nom })),
                    skipDuplicates: true
                });
                break;
        }

        // Récupérer les nouvelles relations créées
        const newRecords = await this.getNewRecords(table, missingValues);
        this.updateCache(table, newRecords);
    }

    private async getNewRecords(table: RelationType, values: string[]) {
        switch (table) {
            case 'disciplines':
                return await prisma.disciplines.findMany({
                    where: { nom: { in: values } },
                    select: { id: true, nom: true }
                });
            case 'lieux':
                return await prisma.lieux.findMany({
                    where: { nom: { in: values } },
                    select: { id: true, nom: true }
                });
            case 'types_hebergement':
                return await prisma.types_hebergement.findMany({
                    where: { nom: { in: values } },
                    select: { id: true, nom: true }
                });
        }
    }

    private updateCache(table: RelationType, records: { id: number; nom: string }[]) {
        const cacheKey: CacheKey = table === 'types_hebergement' ? 'hebergements' : table;
        records.forEach(r => this.relationCache[cacheKey].set(r.nom, r.id));
    }

    private async preloadRelations(formations: Formation[]): Promise<void> {
        // Extraire les valeurs uniques
        const disciplines = new Set(formations.map(f => f.discipline));
        const lieux = new Set(formations.map(f => f.lieu));
        const hebergements = new Set(
            formations.filter(f => f.hebergement).map(f => f.hebergement)
        );

        // Charger les relations existantes en parallèle
        const [existingDisciplines, existingLieux, existingHebergements] = await Promise.all([
            prisma.disciplines.findMany({
                where: { nom: { in: Array.from(disciplines) } },
                select: { id: true, nom: true }
            }),
            prisma.lieux.findMany({
                where: { nom: { in: Array.from(lieux) } },
                select: { id: true, nom: true }
            }),
            prisma.types_hebergement.findMany({
                where: { nom: { in: Array.from(hebergements) } },
                select: { id: true, nom: true }
            })
        ]);

        // Remplir le cache
        existingDisciplines.forEach(d => this.relationCache.disciplines.set(d.nom, d.id));
        existingLieux.forEach(l => this.relationCache.lieux.set(l.nom, l.id));
        existingHebergements.forEach(h => this.relationCache.hebergements.set(h.nom, h.id));

        // Créer les relations manquantes
        await Promise.all([
            this.createMissingRelations('disciplines', disciplines, existingDisciplines),
            this.createMissingRelations('lieux', lieux, existingLieux),
            this.createMissingRelations('types_hebergement', hebergements, existingHebergements)
        ]);
    }

    async upsertFormations(formations: Formation[]): Promise<void> {
        // Pré-charger toutes les relations
        await this.preloadRelations(formations);

        // Traiter les formations par lots pour éviter les problèmes de mémoire
        for (let i = 0; i < formations.length; i += FormationRepository.BATCH_SIZE) {
            const batch = formations.slice(i, i + FormationRepository.BATCH_SIZE);
            await this.processBatch(batch);
        }
    }

    private async processBatch(formations: Formation[]): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // Préparer les données des formations
            const formationsData = formations.map(formation => ({
                reference: formation.reference,
                titre: formation.titre,
                discipline_id: this.relationCache.disciplines.get(formation.discipline)!,
                information_stagiaire: formation.informationStagiaire,
                nombre_participants: formation.nombreParticipants,
                places_restantes: formation.placesRestantes,
                hebergement_id: formation.hebergement ? this.relationCache.hebergements.get(formation.hebergement) : null,
                tarif: new Prisma.Decimal(formation.tarif.toString()),
                lieu_id: this.relationCache.lieux.get(formation.lieu)!,
                organisateur: formation.organisateur,
                responsable: formation.responsable,
                email_contact: formation.emailContact,
                last_seen_at: new Date(),
                status: 'active' as const
            }));

            // Upsert des formations et récupérer les IDs
            const upsertedFormations = await Promise.all(
                formationsData.map(data =>
                    tx.formations.upsert({
                        where: { reference: data.reference },
                        create: { ...data, first_seen_at: new Date() },
                        update: data,
                        select: { id: true, reference: true }
                    })
                )
            );

            // Créer un map des références aux IDs
            const formationMap = new Map(
                upsertedFormations.map(f => [f.reference, f.id])
            );

            // Supprimer toutes les relations existantes en batch
            await Promise.all([
                tx.formations_dates.deleteMany({
                    where: { formation_id: { in: upsertedFormations.map(f => f.id) } }
                }),
                tx.formations_documents.deleteMany({
                    where: { formation_id: { in: upsertedFormations.map(f => f.id) } }
                })
            ]);

            // Préparer les données pour les insertions en masse
            const datesToCreate = formations.flatMap(formation =>
                formation.dates.map(date => ({
                    formation_id: formationMap.get(formation.reference)!,
                    date_debut: new Date(date)
                }))
            );

            const documentsToCreate = formations.flatMap(formation =>
                (formation.documents || []).map(doc => ({
                    formation_id: formationMap.get(formation.reference)!,
                    type: doc.type,
                    nom: doc.nom,
                    url: doc.url
                }))
            );

            // Créer les nouvelles relations en batch
            await Promise.all([
                datesToCreate.length > 0
                    ? tx.formations_dates.createMany({ data: datesToCreate })
                    : Promise.resolve(),
                documentsToCreate.length > 0
                    ? tx.formations_documents.createMany({ data: documentsToCreate })
                    : Promise.resolve()
            ]);
        });
    }

    async upsertFormation(formation: Formation): Promise<void> {
        await this.upsertFormations([formation]);
    }

    async findFormationByReference(reference: string): Promise<Formation | null> {
        const formation = await prisma.formations.findUnique({
            where: { reference },
            include: this.formationInclude
        });

        if (!formation) return null;

        return this.mapFormationToDTO(formation);
    }

    async findAllFormations(): Promise<Formation[]> {
        const formations = await prisma.formations.findMany({
            where: { status: 'active' },
            include: this.formationInclude,
            orderBy: { last_seen_at: 'desc' }
        });

        return formations.map(this.mapFormationToDTO);
    }

    async findAllDisciplines(): Promise<string[]> {
        const disciplines = await prisma.disciplines.findMany({
            orderBy: { nom: 'asc' },
            select: { nom: true }
        });
        return disciplines.map(d => d.nom);
    }

    async getLastSync(): Promise<Date | null> {
        const result = await prisma.formations.aggregate({
            _max: {
                last_seen_at: true
            }
        });
        return result._max.last_seen_at;
    }

    async findRecentFormations(hours: number): Promise<Formation[]> {
        const date = new Date(Date.now() - hours * 60 * 60 * 1000);

        const formations = await prisma.formations.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { created_at: { gte: date } },
                            { last_seen_at: { gte: date } }
                        ]
                    },
                    { status: 'active' }
                ]
            },
            include: this.formationInclude,
            orderBy: { last_seen_at: 'desc' }
        });

        return formations.map(this.mapFormationToDTO);
    }

    private mapFormationToDTO(formation: any): Formation {
        return {
            ...formation,
            disciplines: formation.disciplines ? [formation.disciplines] : [],
            reference: formation.reference,
            titre: formation.titre,
            dates: formation.formations_dates?.map((d: any) => d.date_debut.toISOString()) || [],
            lieu: formation.lieux?.nom || '',
            informationStagiaire: formation.information_stagiaire || '',
            nombreParticipants: formation.nombre_participants !== null && formation.nombre_participants !== undefined 
                ? Number(formation.nombre_participants)
                : null,
            placesRestantes: formation.places_restantes !== null && formation.places_restantes !== undefined 
                ? Number(formation.places_restantes) 
                : null,
            hebergement: formation.types_hebergement?.nom || '',
            tarif: Number(formation.tarif),
            discipline: formation.disciplines?.nom || '',
            organisateur: formation.organisateur,
            responsable: formation.responsable,
            emailContact: formation.email_contact,
            firstSeenAt: formation.first_seen_at,
            lastSeenAt: formation.last_seen_at,
            documents: formation.formations_documents?.map((doc: any) => ({
                type: doc.type,
                nom: doc.nom,
                url: doc.url
            })) || []
        };
    }
}