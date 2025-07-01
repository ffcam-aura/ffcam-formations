import { Formation } from "@/types/formation";
import { format } from "date-fns";

export class EmailTemplateRenderer {
    render(formations: Formation[]): string {
      const formationsByDiscipline = this.groupFormationsByDiscipline(formations);
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${this.renderHeader()}
          ${this.renderFormationsByDiscipline(formationsByDiscipline)}
          ${this.renderFooter(Object.keys(formationsByDiscipline))}
        </div>
      `;
    }
  
    getSubject(formations: Formation[]): string {
      return `[FFCAM] ${formations.length} nouvelle${formations.length > 1 ? 's' : ''} formation${formations.length > 1 ? 's' : ''}`;
    }
  
    private groupFormationsByDiscipline(formations: Formation[]): Record<string, Formation[]> {
      return formations.reduce((acc, formation) => {
        if (!acc[formation.discipline]) {
          acc[formation.discipline] = [];
        }
        acc[formation.discipline].push(formation);
        return acc;
      }, {} as Record<string, Formation[]>);
    }
  
    private renderHeader(): string {
      return `<h2 style="color: #2563eb;">🎯 Nouvelles formations FFCAM</h2>`;
    }
  
    private renderFormationsByDiscipline(formationsByDiscipline: Record<string, Formation[]>): string {
      return Object.entries(formationsByDiscipline)
        .map(([discipline, formations]) => `
          <div style="margin-top: 30px;">
            ${this.renderDisciplineHeader(discipline, formations.length)}
            ${formations.map(formation => this.renderFormation(formation)).join('')}
          </div>
        `).join('');
    }
  
    private renderDisciplineHeader(discipline: string, formationCount: number): string {
      return `
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          ${discipline} (${formationCount} formation${formationCount > 1 ? 's' : ''})
        </h3>
      `;
    }
  
    private renderFormation(formation: Formation): string {
      return `
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">${formation.titre}</h4>
          <ul style="list-style: none; padding: 0;">
            ${this.renderFormationDetails(formation)}
          </ul>
          // ${this.renderFormationLink(formation)}
        </div>
      `;
    }
  
    private renderFormationDetails(formation: Formation): string {
      const details = [
          { icon: '📍', label: 'Lieu', value: formation.lieu },
          { icon: '📅', label: 'Dates', value: formation.dates.map(date => this.formatDate(date)).join(' au ') },
          ...this.renderOptionalInformation(formation),
          { 
            icon: '👥', 
            label: 'Participants', 
            value: `${formation.nombreParticipants} maximum${
              formation.placesRestantes ? ` (${formation.placesRestantes} places restantes)` : ''
            }` 
          },
          formation.tarif ? { icon: '💰', label: 'Tarif', value: `${formation.tarif}€` } : null,
          { icon: '🏠', label: 'Hébergement', value: formation.hebergement },
          { icon: '👤', label: 'Organisateur', value: formation.organisateur },
          { icon: '👨‍🏫', label: 'Responsable', value: formation.responsable },
          formation.emailContact ? { icon: '✉️', label: 'Contact', value: formation.emailContact } : null
      ].filter((detail): detail is { icon: string; label: string; value: string } => Boolean(detail));
  
      return details.map(detail => this.renderDetailLine(detail)).join('') + 
             this.renderDocuments(formation.documents);
  }
  
  
    private renderOptionalInformation(formation: Formation): Array<{ icon: string; label: string; value: string; }> {
      return formation.informationStagiaire 
        ? [{ icon: 'ℹ️', label: 'Informations', value: formation.informationStagiaire }]
        : [];
    }
  
    private renderDetailLine(detail: { icon: string; label: string; value: string }): string {
      return `
        <li style="margin-bottom: 10px;">
          ${detail.icon} <strong>${detail.label}:</strong> ${detail.value}
        </li>
      `;
    }
  
    private renderDocuments(documents: Formation['documents']): string {
      if (!documents.length) return '';
  
      return `
        <li style="margin-bottom: 10px;">
          📄 <strong>Documents:</strong>
          <ul style="list-style: none; padding-left: 20px; margin-top: 5px;">
            ${documents.map(doc => `
              <li style="margin-bottom: 5px;">
                <a href="${doc.url}" style="color: #2563eb; text-decoration: none;">
                  ${doc.nom} (${doc.type})
                </a>
              </li>
            `).join('')}
          </ul>
        </li>
      `;
    }
  
    private renderFormationLink(formation: Formation): string {
      return `
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}"
             style="background-color: #2563eb; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Voir les détails
          </a>
        </div>
      `;
    }
  
    private renderFooter(disciplines: string[]): string {
      return `
        <p style="color: #64748b; font-size: 0.875rem; margin-top: 20px;">
          Pour gérer vos préférences de notification, 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/notifications" 
             style="color: #2563eb; text-decoration: none;">
            cliquez ici
          </a>
        </p>
  
        <div style="color: #64748b; font-size: 0.75rem; margin-top: 20px; 
                    border-top: 1px solid #e2e8f0; padding-top: 10px;">
          <p style="margin: 5px 0;">
            Cet email a été envoyé automatiquement par le Club Alpin Français.
          </p>
          <p style="margin: 5px 0;">
            Vous recevez cet email car vous êtes inscrit aux notifications pour les disciplines suivantes : 
            ${disciplines.join(', ')}.
          </p>
        </div>
      `;
    }
  
    private formatDate(dateString: string): string {
      return format(new Date(dateString), "dd/MM/yyyy");
    }
  }