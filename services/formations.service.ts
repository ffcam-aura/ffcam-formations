import { sql } from '@vercel/postgres';
import { Formation } from '@/types/formation';

export class FormationsService {
    private static parseDate(dateStr: string | Date): Date {
        if (dateStr instanceof Date) {
            return dateStr;
        }

        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(`${year}-${month}-${day}`);
        }

        return new Date(dateStr);
    }

    static async upsertDiscipline(discipline: string): Promise<number> {
        try {
            const { rows } = await sql`
                INSERT INTO disciplines (nom)
                VALUES (${discipline})
                ON CONFLICT (nom) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                RETURNING id
            `;
            return rows[0].id;
        } catch (error) {
            console.error('Error upserting discipline:', error);
            throw error;
        }
    }

    static async upsertLieu(lieu: string): Promise<number> {
        try {
            const { rows } = await sql`
                INSERT INTO lieux (nom)
                VALUES (${lieu})
                ON CONFLICT (nom) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                RETURNING id
            `;
            return rows[0].id;
        } catch (error) {
            console.error('Error upserting lieu:', error);
            throw error;
        }
    }

    static async upsertHebergement(hebergement: string): Promise<number> {
        try {
            const { rows } = await sql`
                INSERT INTO types_hebergement (nom)
                VALUES (${hebergement})
                ON CONFLICT (nom) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                RETURNING id
            `;
            return rows[0].id;
        } catch (error) {
            console.error('Error upserting hebergement:', error);
            throw error;
        }
    }

    private static async upsertDocuments(formationId: number, documents: Formation['documents']): Promise<void> {
        if (!documents || documents.length === 0) return;

        await sql`
            DELETE FROM formations_documents
            WHERE formation_id = ${formationId}
        `;

        for (const doc of documents) {
            await sql`
                INSERT INTO formations_documents (
                    formation_id, type, nom, url
                ) VALUES (
                    ${formationId}, ${doc.type}, ${doc.nom}, ${doc.url}
                )
            `;
        }
    }

    static async upsertFormation(formation: Formation): Promise<void> {
        try {
            const disciplineId = await this.upsertDiscipline(formation.discipline);
            const lieuId = await this.upsertLieu(formation.lieu);
            const hebergementId = await this.upsertHebergement(formation.hebergement);

            const { rows: existingFormation } = await sql`
                SELECT id FROM formations WHERE reference = ${formation.reference}
            `;

            let formationId: number;

            if (existingFormation.length === 0) {
                const { rows: [newFormation] } = await sql`
                    INSERT INTO formations (
                        reference, titre, discipline_id, information_stagiaire,
                        nombre_participants, places_restantes, hebergement_id,
                        tarif, lieu_id, organisateur, responsable, email_contact,
                        first_seen_at, last_seen_at
                    ) VALUES (
                        ${formation.reference}, ${formation.titre}, ${disciplineId},
                        ${formation.informationStagiaire}, ${formation.nombreParticipants},
                        ${formation.placesRestantes}, ${hebergementId}, ${formation.tarif},
                        ${lieuId}, ${formation.organisateur}, ${formation.responsable},
                        ${formation.emailContact}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    RETURNING id
                `;
                formationId = newFormation.id;
            } else {
                formationId = existingFormation[0].id;
                await sql`
                    UPDATE formations SET
                        titre = ${formation.titre},
                        discipline_id = ${disciplineId},
                        information_stagiaire = ${formation.informationStagiaire},
                        nombre_participants = ${formation.nombreParticipants},
                        places_restantes = ${formation.placesRestantes},
                        hebergement_id = ${hebergementId},
                        tarif = ${formation.tarif},
                        lieu_id = ${lieuId},
                        organisateur = ${formation.organisateur},
                        responsable = ${formation.responsable},
                        email_contact = ${formation.emailContact},
                        last_seen_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${formationId}
                `;
            }

            await sql`DELETE FROM formations_dates WHERE formation_id = ${formationId}`;
            for (const dateStr of formation.dates) {
                const parsedDate = this.parseDate(dateStr);
                await sql`
                    INSERT INTO formations_dates (formation_id, date_debut)
                    VALUES (${formationId}, ${parsedDate.toISOString().split('T')[0]})
                `;
            }

            await this.upsertDocuments(formationId, formation.documents);

        } catch (error) {
            console.error(`Error upserting formation ${formation.reference}:`, error);
            throw error;
        }
    }

    static async getLastSync(): Promise<Date | null> {
        const { rows } = await sql`
            SELECT MAX(last_seen_at) as last_sync
            FROM formations
        `;
        return rows[0].last_sync;
    }

    static async getFormationByReference(reference: string): Promise<Formation | null> {
        const { rows } = await sql`
            SELECT 
                f.reference, 
                f.titre, 
                array_agg(DISTINCT fd.date_debut) as dates,
                l.nom as lieu, 
                f.information_stagiaire as "informationStagiaire",
                f.nombre_participants as "nombreParticipants",
                f.places_restantes as "placesRestantes",
                h.nom as hebergement,
                f.tarif, 
                d.nom as discipline,
                f.organisateur, 
                f.responsable,
                f.first_seen_at as "firstSeenAt",
                f.email_contact as "emailContact",
                json_agg(
                    DISTINCT jsonb_build_object(
                        'type', doc.type,
                        'nom', doc.nom,
                        'url', doc.url
                    )
                ) FILTER (WHERE doc.id IS NOT NULL) as documents
            FROM formations f
            LEFT JOIN disciplines d ON f.discipline_id = d.id
            LEFT JOIN lieux l ON f.lieu_id = l.id
            LEFT JOIN types_hebergement h ON f.hebergement_id = h.id
            LEFT JOIN formations_dates fd ON f.id = fd.formation_id
            LEFT JOIN formations_documents doc ON f.id = doc.formation_id
            WHERE f.reference = ${reference}
            GROUP BY f.id, d.nom, l.nom, h.nom
        `;

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            reference: row.reference,
            titre: row.titre,
            dates: row.dates || [],
            lieu: row.lieu,
            informationStagiaire: row.informationStagiaire,
            nombreParticipants: row.nombreParticipants,
            placesRestantes: row.placesRestantes,
            hebergement: row.hebergement,
            tarif: row.tarif,
            discipline: row.discipline,
            organisateur: row.organisateur,
            responsable: row.responsable,
            emailContact: row.emailContact,
            firstSeenAt: row.firstSeenAt,
            documents: row.documents || []
        };
    }

    static async getAllFormations(): Promise<Formation[]> {
        const { rows } = await sql`
            SELECT 
                f.reference, 
                f.titre, 
                array_agg(DISTINCT fd.date_debut) as dates,
                l.nom as lieu, 
                f.information_stagiaire as "informationStagiaire",
                f.nombre_participants as "nombreParticipants",
                f.places_restantes as "placesRestantes",
                h.nom as hebergement,
                f.tarif, 
                d.nom as discipline,
                f.organisateur, 
                f.responsable,
                f.first_seen_at as "firstSeenAt",
                f.email_contact as "emailContact",
                json_agg(
                    DISTINCT jsonb_build_object(
                        'type', doc.type,
                        'nom', doc.nom,
                        'url', doc.url
                    )
                ) FILTER (WHERE doc.id IS NOT NULL) as documents
            FROM formations f
            LEFT JOIN disciplines d ON f.discipline_id = d.id
            LEFT JOIN lieux l ON f.lieu_id = l.id
            LEFT JOIN types_hebergement h ON f.hebergement_id = h.id
            LEFT JOIN formations_dates fd ON f.id = fd.formation_id
            LEFT JOIN formations_documents doc ON f.id = doc.formation_id
            GROUP BY f.id, d.nom, l.nom, h.nom
        `;

        return rows.map(row => ({
            reference: row.reference,
            titre: row.titre,
            dates: row.dates || [],
            lieu: row.lieu,
            informationStagiaire: row.informationStagiaire,
            nombreParticipants: row.nombreParticipants,
            placesRestantes: row.placesRestantes,
            hebergement: row.hebergement,
            tarif: row.tarif,
            discipline: row.discipline,
            organisateur: row.organisateur,
            responsable: row.responsable,
            emailContact: row.emailContact,
            firstSeenAt: row.firstSeenAt,
            documents: row.documents || []
        }));
    }

    static async getAllDisciplines(): Promise<string[]> {
        try {
            const { rows } = await sql`
                SELECT nom
                FROM disciplines
                ORDER BY nom ASC
            `;

            return rows.map(row => row.nom);
        } catch (error) {
            console.error('Error getting disciplines:', error);
            throw error;
        }
    }

    static async getRecentFormations(hours: number): Promise<Formation[]> {
        try {
            const { rows } = await sql.query(
                `WITH base_formations AS (
                    SELECT 
                        f.id,
                        f.reference,
                        f.titre,
                        d.nom as discipline,
                        f.information_stagiaire as "informationStagiaire",
                        f.nombre_participants as "nombreParticipants",
                        f.places_restantes as "placesRestantes",
                        h.nom as hebergement,
                        COALESCE(f.tarif, 0) as tarif,
                        l.nom as lieu,
                        f.organisateur,
                        f.responsable,
                        f.email_contact as "emailContact",
                        f.first_seen_at::text as "firstSeenAt"
                    FROM formations f
                    JOIN disciplines d ON f.discipline_id = d.id
                    JOIN lieux l ON f.lieu_id = l.id
                    JOIN types_hebergement h ON f.hebergement_id = h.id
                    WHERE f.created_at >= NOW() - ($1 || ' hours')::interval
                    AND f.status = 'active'
                ),
                formation_dates AS (
                    SELECT 
                        f.id,
                        array_agg(DISTINCT TO_CHAR(fd.date_debut, 'YYYY-MM-DD')) FILTER (WHERE fd.date_debut IS NOT NULL) as dates
                    FROM base_formations f
                    LEFT JOIN formations_dates fd ON f.id = fd.formation_id
                    GROUP BY f.id
                ),
                formation_docs AS (
                    SELECT 
                        f.id,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'type', fd.type,
                                    'nom', fd.nom,
                                    'url', fd.url
                                )
                            ) FILTER (WHERE fd.id IS NOT NULL),
                            '[]'::json
                        ) as documents
                    FROM base_formations f
                    LEFT JOIN formations_documents fd ON f.id = fd.formation_id
                    GROUP BY f.id
                )
                SELECT
                    f.*,
                    COALESCE(fd.dates, ARRAY[]::text[]) as dates,
                    COALESCE(d.documents, '[]'::json) as documents
                FROM base_formations f
                LEFT JOIN formation_dates fd ON f.id = fd.id
                LEFT JOIN formation_docs d ON f.id = d.id`,
                [hours]
            );
    
            return rows.map(row => ({
                reference: row.reference,
                titre: row.titre,
                dates: row.dates || [],
                lieu: row.lieu,
                informationStagiaire: row.informationStagiaire || '',
                nombreParticipants: Number(row.nombreParticipants),
                placesRestantes: row.placesRestantes !== null ? Number(row.placesRestantes) : null,
                hebergement: row.hebergement,
                tarif: Number(row.tarif),
                discipline: row.discipline,
                organisateur: row.organisateur,
                responsable: row.responsable,
                emailContact: row.emailContact,
                documents: Array.isArray(row.documents) ? row.documents : [],
                firstSeenAt: row.firstSeenAt
            }));
        } catch (error) {
            console.error('Error getting recent formations:', error);
            throw error;
        }
    }
}