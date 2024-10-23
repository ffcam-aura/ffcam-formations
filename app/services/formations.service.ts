// app/services/formations.service.ts
import { sql } from '@vercel/postgres';
import { Formation } from '@/app/types/formation';

export class FormationsService {
    private static parseDate(dateStr: string | Date): Date {
        // Si dateStr est déjà un objet Date, on le retourne directement
        if (dateStr instanceof Date) {
            return dateStr;
        }
    
        // Vérifier que la chaîne n'est pas vide et que c'est bien une chaîne
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(`${year}-${month}-${day}`);
        }
    
        // Si le format est déjà YYYY-MM-DD ou une chaîne de date valide
        return new Date(dateStr);
    }
    static async upsertDiscipline(discipline: string): Promise<number> {
        try {
            const { rows } = await sql`
        INSERT INTO disciplines (nom)
        VALUES (${discipline})
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;

            if (rows.length === 0) {
                const { rows: existingRows } = await sql`
          SELECT id FROM disciplines WHERE nom = ${discipline}
        `;
                return existingRows[0].id;
            }

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
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;

            if (rows.length === 0) {
                const { rows: existingRows } = await sql`
          SELECT id FROM lieux WHERE nom = ${lieu}
        `;
                return existingRows[0].id;
            }

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
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;

            if (rows.length === 0) {
                const { rows: existingRows } = await sql`
          SELECT id FROM types_hebergement WHERE nom = ${hebergement}
        `;
                return existingRows[0].id;
            }

            return rows[0].id;
        } catch (error) {
            console.error('Error upserting hebergement:', error);
            throw error;
        }
    }

    static async upsertFormation(formation: Formation): Promise<void> {
        try {
            // 1. Récupérer ou créer les IDs des références
            const disciplineId = await this.upsertDiscipline(formation.discipline);
            const lieuId = await this.upsertLieu(formation.lieu);
            const hebergementId = await this.upsertHebergement(formation.hebergement);

            // 2. Vérifier si la formation existe
            const { rows: existingFormation } = await sql`
        SELECT id FROM formations WHERE reference = ${formation.reference}
      `;

            let formationId: number;

            if (existingFormation.length === 0) {
                // 3a. Créer une nouvelle formation
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
                // 3b. Mettre à jour la formation existante
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

            // 4. Supprimer les anciennes dates
            await sql`
        DELETE FROM formations_dates
        WHERE formation_id = ${formationId}
      `;

      // Utiliser la nouvelle fonction parseDate pour chaque date
      for (const dateStr of formation.dates) {
        const parsedDate = this.parseDate(dateStr);
        await sql`
        INSERT INTO formations_dates (formation_id, date_debut)
        VALUES (${formationId}, ${parsedDate.toISOString().split('T')[0]})
      `;
      }

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
        SELECT f.reference, 
               f.titre, 
               array_agg(fd.date_debut) as dates,
               l.nom as lieu, 
               f.information_stagiaire as "informationStagiaire",
               f.nombre_participants as "nombreParticipants",
               f.places_restantes as "placesRestantes",
               h.nom as hebergement,
               f.tarif, 
               d.nom as discipline,
               f.organisateur, 
               f.responsable, 
               f.email_contact as "emailContact"
        FROM formations f
        LEFT JOIN disciplines d ON f.discipline_id = d.id
        LEFT JOIN lieux l ON f.lieu_id = l.id
        LEFT JOIN types_hebergement h ON f.hebergement_id = h.id
        LEFT JOIN formations_dates fd ON f.id = fd.formation_id
        WHERE f.reference = ${reference}
        GROUP BY f.id, d.nom, l.nom, h.nom
        `;
    
        // Vérification que les données correspondent bien au schéma Formation
        if (rows.length === 0) {
            return null;
        }
    
        const row = rows[0];
    
        // Mapping des résultats SQL à un objet de type Formation
        const formation: Formation = {
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
        };
    
        return formation;
    }
    

    static async getAllFormations(): Promise<Formation[]> {
        try {
            const { rows } = await sql`
            SELECT f.*, 
                   d.nom as discipline,
                   l.nom as lieu,
                   h.nom as hebergement,
                   array_agg(fd.date_debut) as dates
            FROM formations f
            LEFT JOIN disciplines d ON f.discipline_id = d.id
            LEFT JOIN lieux l ON f.lieu_id = l.id
            LEFT JOIN types_hebergement h ON f.hebergement_id = h.id
            LEFT JOIN formations_dates fd ON f.id = fd.formation_id
            GROUP BY f.id, d.nom, l.nom, h.nom
          `;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rows.map((row: any) => ({
                reference: row.reference,
                titre: row.titre,
                discipline: row.discipline,
                informationStagiaire: row.information_stagiaire,
                nombreParticipants: row.nombre_participants,
                placesRestantes: row.places_restantes,
                hebergement: row.hebergement,
                tarif: row.tarif,
                lieu: row.lieu,
                organisateur: row.organisateur,
                responsable: row.responsable,
                emailContact: row.email_contact,
                dates: row.dates.map((date: string) => this.parseDate(date))
            }));
        } catch (error) {
            console.error('Error fetching all formations:', error);
            throw error;
        }
    }
    
}