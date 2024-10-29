import { prisma } from "@/lib/prisma";
import { Formation } from "@/types/formation";
import { Prisma } from "@prisma/client";

export interface IFormationRepository {
    upsertDiscipline(discipline: string): Promise<number>;
    upsertLieu(lieu: string): Promise<number>;
    upsertHebergement(hebergement: string): Promise<number>;
    upsertDocuments(formationId: number, documents: Formation['documents']): Promise<void>;
    findFormationByReference(reference: string): Promise<Formation | null>;
    findAllFormations(): Promise<Formation[]>;
    findAllDisciplines(): Promise<string[]>;
    findRecentFormations(hours: number): Promise<Formation[]>;
    getLastSync(): Promise<Date | null>;
    upsertFormation(formation: Formation): Promise<void>;
}

export class FormationRepository implements IFormationRepository {
    private formationInclude = {
        disciplines: true,
        lieux: true,
        types_hebergement: true,
        formations_dates: true,
        formations_documents: true
    };

    async upsertDiscipline(discipline: string): Promise<number> {
        const result = await prisma.disciplines.upsert({
            where: { nom: discipline },
            create: { nom: discipline },
            update: { updated_at: new Date() },
            select: { id: true }
        });
        return result.id;
    }

    async upsertLieu(lieu: string): Promise<number> {
        const result = await prisma.lieux.upsert({
            where: { nom: lieu },
            create: { nom: lieu },
            update: { updated_at: new Date() },
            select: { id: true }
        });
        return result.id;
    }

    async upsertHebergement(hebergement: string): Promise<number> {
        const result = await prisma.types_hebergement.upsert({
            where: { nom: hebergement },
            create: { nom: hebergement },
            update: { updated_at: new Date() },
            select: { id: true }
        });
        return result.id;
    }

    async upsertDocuments(formationId: number, documents: Formation['documents']): Promise<void> {
        if (!documents?.length) return;

        await prisma.formations_documents.deleteMany({
            where: { formation_id: formationId }
        });

        await prisma.formations_documents.createMany({
            data: documents.map(doc => ({
                formation_id: formationId,
                type: doc.type,
                nom: doc.nom,
                url: doc.url
            }))
        });
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
            include: this.formationInclude
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

    async upsertFormation(formation: Formation): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // 1. Upsert des relations
            const [disciplineId, lieuId, hebergementId] = await Promise.all([
                this.upsertDiscipline(formation.discipline),
                this.upsertLieu(formation.lieu),
                this.upsertHebergement(formation.hebergement)
            ]);

            // 2. Préparer les données de la formation
            const formationData = {
                titre: formation.titre,
                discipline_id: disciplineId,
                information_stagiaire: formation.informationStagiaire,
                nombre_participants: formation.nombreParticipants,
                places_restantes: formation.placesRestantes,
                hebergement_id: hebergementId,
                tarif: new Prisma.Decimal(formation.tarif.toString()),
                lieu_id: lieuId,
                organisateur: formation.organisateur,
                responsable: formation.responsable,
                email_contact: formation.emailContact,
                last_seen_at: new Date(),
                status: 'active' as const
            };

            // 3. Upsert de la formation
            const upsertedFormation = await tx.formations.upsert({
                where: { 
                    reference: formation.reference 
                },
                create: {
                    reference: formation.reference,
                    first_seen_at: new Date(),
                    ...formationData
                },
                update: formationData
            });

            // 4. Supprimer les dates existantes
            await tx.formations_dates.deleteMany({
                where: { 
                    formation_id: upsertedFormation.id 
                }
            });

            // 5. Créer les nouvelles dates
            if (formation.dates.length > 0) {
                await tx.formations_dates.createMany({
                    data: formation.dates.map(date => ({
                        formation_id: upsertedFormation.id,
                        date_debut: new Date(date)
                    }))
                });
            }

            // 6. Supprimer les documents existants
            await tx.formations_documents.deleteMany({
                where: { 
                    formation_id: upsertedFormation.id 
                }
            });

            // 7. Créer les nouveaux documents
            if (formation.documents?.length > 0) {
                await tx.formations_documents.createMany({
                    data: formation.documents.map(doc => ({
                        formation_id: upsertedFormation.id,
                        type: doc.type,
                        nom: doc.nom,
                        url: doc.url
                    }))
                });
            }
        });
    }

    private mapFormationToDTO(formation: any): Formation {
        return {
            reference: formation.reference,
            titre: formation.titre,
            dates: formation.formations_dates?.map((d: any) => d.date_debut) || [],
            lieu: formation.lieux?.nom || '',
            informationStagiaire: formation.information_stagiaire || '',
            nombreParticipants: Number(formation.nombre_participants),
            placesRestantes: formation.places_restantes ? Number(formation.places_restantes) : null,
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
            include: {
                disciplines: true,
                lieux: true,
                types_hebergement: true,
                formations_dates: {
                    orderBy: {
                        date_debut: 'asc'
                    }
                },
                formations_documents: true
            },
            orderBy: {
                last_seen_at: 'desc'
            }
        });

        return formations.map(this.mapFormationToDTO);
    }
}