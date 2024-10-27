import { sql } from '@vercel/postgres';
import { EmailService } from '@/app/services/email.service';
import { UserService } from '@/app/services/users.service';
import { Formation } from '@/app/types/formation';

interface NotificationResult {
  formation: Formation;
  usersNotified: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

export class NotificationService {
  static async notifyBatchNewFormations(formations: Formation[]): Promise<NotificationResult[]> {
    try {
      // 1. Récupérer tous les utilisateurs uniques à notifier pour toutes les disciplines concernées
      const disciplines = [...new Set(formations.map(f => f.discipline))];
      const userNotifications = new Map<string, {
        email: string,
        formations: Formation[]
      }>();

      // Pour chaque discipline
      for (const discipline of disciplines) {
        const usersToNotify = await UserService.getUsersToNotifyForDiscipline(discipline);
        
        // Pour chaque utilisateur éligible pour cette discipline
        for (const {userId, email} of usersToNotify) {
          // Vérifie si l'utilisateur peut être notifié (délai 24h)
          const { rows: [lastNotification] } = await sql`
            SELECT unp.last_notified_at
            FROM user_notification_preferences unp
            JOIN user_preferences up ON up.id = unp.user_preference_id
            JOIN disciplines d ON d.id = unp.discipline_id
            WHERE up.user_id = ${userId}
            AND d.nom = ${discipline}
          `;

          const shouldNotify = !lastNotification?.last_notified_at || 
            (new Date().getTime() - new Date(lastNotification.last_notified_at).getTime()) > 24 * 60 * 60 * 1000;

          if (shouldNotify) {
            // Ajoute les formations de cette discipline pour cet utilisateur
            const disciplineFormations = formations.filter(f => f.discipline === discipline);
            
            if (!userNotifications.has(userId)) {
              userNotifications.set(userId, { email, formations: [] });
            }
            userNotifications.get(userId)!.formations.push(...disciplineFormations);
          }
        }
      }

      // 2. Envoyer un seul email par utilisateur avec toutes ses formations
      const results: NotificationResult[] = [];
      for (const [userId, { email, formations: userFormations }] of userNotifications) {
        try {
          // Envoie un seul email avec toutes les formations
          await this.sendNotificationEmailForMultipleFormations(email, userFormations);
          
          // Met à jour last_notified_at pour chaque discipline
          const userDisciplines = [...new Set(userFormations.map(f => f.discipline))];
          for (const discipline of userDisciplines) {
            await UserService.updateLastNotified(userId, discipline);
          }

          // Ajoute un résultat pour chaque formation
          userFormations.forEach(formation => {
            results.push({
              formation,
              usersNotified: 1,
              errors: []
            });
          });
        } catch (error) {
          userFormations.forEach(formation => {
            results.push({
              formation,
              usersNotified: 0,
              errors: [{
                userId,
                error: error instanceof Error ? error.message : String(error)
              }]
            });
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in batch notification:', error);
      throw error;
    }
  }

  private static async sendNotificationEmailForMultipleFormations(
    email: string,
    formations: Formation[]
  ): Promise<void> {
    // Groupe les formations par discipline pour une meilleure présentation
    const formationsByDiscipline = formations.reduce((acc, formation) => {
      if (!acc[formation.discipline]) {
        acc[formation.discipline] = [];
      }
      acc[formation.discipline].push(formation);
      return acc;
    }, {} as Record<string, Formation[]>);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎯 Nouvelles formations FFCAM</h2>
        
        ${Object.entries(formationsByDiscipline).map(([discipline, disciplineFormations]) => `
          <div style="margin-top: 30px;">
            <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
              ${discipline} (${disciplineFormations.length} formation${disciplineFormations.length > 1 ? 's' : ''})
            </h3>

            ${disciplineFormations.map(formation => `
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #1e293b; margin-top: 0;">${formation.titre}</h4>
                
                <ul style="list-style: none; padding: 0;">
                  <li style="margin-bottom: 10px;">📍 <strong>Lieu:</strong> ${formation.lieu}</li>
                  <li style="margin-bottom: 10px;">📅 <strong>Dates:</strong> ${formation.dates.join(' au ')}</li>
                  ${formation.informationStagiaire ? `
                    <li style="margin-bottom: 10px;">ℹ️ <strong>Informations:</strong> ${formation.informationStagiaire}</li>
                  ` : ''}
                  <li style="margin-bottom: 10px;">👥 <strong>Participants:</strong> ${formation.nombreParticipants} maximum${
                    formation.placesRestantes ? ` (${formation.placesRestantes} places restantes)` : ''
                  }</li>
                  ${formation.tarif ? `
                    <li style="margin-bottom: 10px;">💰 <strong>Tarif:</strong> ${formation.tarif}€</li>
                  ` : ''}
                  <li style="margin-bottom: 10px;">🏠 <strong>Hébergement:</strong> ${formation.hebergement}</li>
                  <li style="margin-bottom: 10px;">👤 <strong>Organisateur:</strong> ${formation.organisateur}</li>
                  <li style="margin-bottom: 10px;">👨‍🏫 <strong>Responsable:</strong> ${formation.responsable}</li>
                  ${formation.emailContact ? `
                    <li style="margin-bottom: 10px;">✉️ <strong>Contact:</strong> ${formation.emailContact}</li>
                  ` : ''}
                  ${formation.documents.length > 0 ? `
                    <li style="margin-bottom: 10px;">📄 <strong>Documents:</strong>
                      <ul style="list-style: none; padding-left: 20px; margin-top: 5px;">
                        ${formation.documents.map(doc => `
                          <li style="margin-bottom: 5px;">
                            <a href="${doc.url}" style="color: #2563eb; text-decoration: none;">
                              ${doc.nom} (${doc.type})
                            </a>
                          </li>
                        `).join('')}
                      </ul>
                    </li>
                  ` : ''}
                </ul>

                <div style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/formations/${formation.reference}"
                     style="background-color: #2563eb; color: white; padding: 10px 20px; 
                            text-decoration: none; border-radius: 5px; display: inline-block;">
                    Voir les détails
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
        
        <p style="color: #64748b; font-size: 0.875rem; margin-top: 20px;">
          Pour gérer vos préférences de notification, 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/notifications" style="color: #2563eb; text-decoration: none;">
            cliquez ici
          </a>
        </p>

        <div style="color: #64748b; font-size: 0.75rem; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          <p style="margin: 5px 0;">
            Cet email a été envoyé automatiquement par le Club Alpin Français.
          </p>
          <p style="margin: 5px 0;">
            Vous recevez cet email car vous êtes inscrit aux notifications pour les disciplines suivantes : 
            ${Object.keys(formationsByDiscipline).join(', ')}.
          </p>
        </div>
      </div>
    `;

    await EmailService.sendEmail({
      to: email,
      subject: `[FFCAM] ${formations.length} nouvelle${formations.length > 1 ? 's' : ''} formation${formations.length > 1 ? 's' : ''}`,
      html: htmlContent
    });
  }
}