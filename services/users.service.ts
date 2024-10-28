// lib/services/users.ts
import { sql } from '@vercel/postgres';

export class UserService {
    /**
     * Récupère les préférences de notification d'un utilisateur
     */
    static async getNotificationPreferences(userId: string): Promise<string[]> {
        try {
            const { rows } = await sql`
                SELECT DISTINCT d.nom as discipline
                FROM user_preferences up
                JOIN user_notification_preferences unp ON up.id = unp.user_preference_id
                JOIN disciplines d ON unp.discipline_id = d.id
                WHERE up.user_id = ${userId}
                AND unp.enabled = true
                ORDER BY d.nom ASC
            `;
            
            return rows.map(row => row.discipline);
        } catch (error) {
            console.error('Error getting user preferences:', error);
            throw error;
        }
    }

    static async updateNotificationPreferences(userId: string, email: string, disciplines: string[]): Promise<void> {
        try {
            // Assure que l'utilisateur existe dans user_preferences
            const { rows: [userPref] } = await sql`
                INSERT INTO user_preferences (user_id, email)
                VALUES (${userId}, ${email})
                ON CONFLICT (user_id) 
                DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                RETURNING id
            `;

            // Supprime les préférences existantes
            await sql`
                DELETE FROM user_notification_preferences
                WHERE user_preference_id = ${userPref.id}
            `;

            // Si il y a des disciplines à ajouter
            if (disciplines.length > 0) {
                // Construit la requête pour récupérer les IDs des disciplines
                const placeholders = disciplines.map((_, i) => `$${i + 1}`).join(',');
                const { rows: disciplineRows } = await sql.query(
                    `SELECT id, nom FROM disciplines WHERE nom IN (${placeholders})`,
                    disciplines
                );

                // Insère les nouvelles préférences
                for (const discipline of disciplineRows) {
                    await sql`
                        INSERT INTO user_notification_preferences 
                        (user_preference_id, discipline_id)
                        VALUES (${userPref.id}, ${discipline.id})
                    `;
                }
            }
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    }

    /**
     * Vérifie si un utilisateur doit être notifié pour une discipline donnée
     */
    static async shouldNotifyForDiscipline(userId: string, discipline: string): Promise<boolean> {
        try {
            const { rows } = await sql`
                SELECT 1
                FROM user_preferences up
                JOIN user_notification_preferences unp ON up.id = unp.user_preference_id
                JOIN disciplines d ON unp.discipline_id = d.id
                WHERE up.user_id = ${userId}
                AND d.nom = ${discipline}
                AND unp.enabled = true
            `;
            
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking notification status:', error);
            throw error;
        }
    }

    /**
     * Met à jour la date de dernière notification pour une discipline
     */
    static async updateLastNotified(userId: string, discipline: string): Promise<void> {
        try {
            await sql`
                UPDATE user_notification_preferences unp
                SET last_notified_at = CURRENT_TIMESTAMP
                FROM user_preferences up, disciplines d
                WHERE up.id = unp.user_preference_id
                AND d.id = unp.discipline_id
                AND up.user_id = ${userId}
                AND d.nom = ${discipline}
            `;
        } catch (error) {
            console.error('Error updating last notified timestamp:', error);
            throw error;
        }
    }

    /**
     * Récupère tous les utilisateurs qui doivent être notifiés pour une discipline donnée
     */
    static async getUsersToNotifyForDiscipline(discipline: string): Promise<Array<{userId: string, email: string}>> {
        try {
            const { rows } = await sql`
                SELECT DISTINCT 
                    up.user_id,
                    up.email
                FROM user_preferences up
                JOIN user_notification_preferences unp ON up.id = unp.user_preference_id
                JOIN disciplines d ON unp.discipline_id = d.id
                WHERE d.nom = ${discipline}
                AND unp.enabled = true
                AND (
                    unp.last_notified_at IS NULL 
                    OR unp.last_notified_at < NOW() - INTERVAL '24 hours'
                )
            `;
            
            return rows.map(row => ({
                userId: row.user_id,
                email: row.email
            }));
        } catch (error) {
            console.error('Error getting users to notify:', error);
            throw error;
        }
    }
}