import { FFCAMScraper } from '@/app/lib/scraper';
import { FormationsService } from '@/app/services/formations.service';
import { EmailService } from '@/app/services/email.service';
import { Formation } from '@/app/types/formation';
import { generateStats } from '@/app/utils/stats';

interface SyncResult {
  formations: Formation[];
  succeeded: number;
  errors: Array<{reference: string; error: string}>;
  duration: number;
  stats: {
    total: number;
    synchronized: number;
    errors: number;
    duration: string;
  };
}

export class SyncService {
  static async getLastSyncDate() {
    return FormationsService.getLastSync();
  }

  static async synchronize(): Promise<SyncResult> {
    const startTime = new Date();
    console.log('\n🔍 Démarrage du scraping des formations FFCAM...\n');
    
    const formations = await FFCAMScraper.scrapeFormations();
    await this.logFormations(formations);
    
    const { succeeded, errors } = await this.syncFormations(formations);
    
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    return {
      formations,
      succeeded,
      errors,
      duration,
      stats: {
        total: formations.length,
        synchronized: succeeded,
        errors: errors.length,
        duration: `${duration.toFixed(2)}s`,
      }
    };
  }

  private static async syncFormations(formations: Formation[]) {
    console.log('\n💾 SYNCHRONISATION AVEC LA BASE DE DONNÉES:');
    let succeeded = 0;
    const errors: Array<{reference: string; error: string}> = [];
    
    for (const formation of formations) {
      try {
        await FormationsService.upsertFormation(formation);
        succeeded++;
        process.stdout.write(`\r• Progression : ${succeeded}/${formations.length} formations synchronisées`);
      } catch (error) {
        console.error(`\n❌ Échec pour ${formation.reference}:`, error);
        errors.push({
          reference: formation.reference,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return { succeeded, errors };
  }

  static async sendSyncReport({ formations, succeeded, errors, duration }: SyncResult) {
    const stats = generateStats(formations);
    const htmlReport = this.generateHtmlReport({ formations, succeeded, errors, duration, stats });
    
    await EmailService.sendEmail({
      to: 'nicolas@ritouet.com',
      subject: `[FFCAM] Rapport de synchronisation : ${errors.length === 0 ? 'Succès' : 'Erreurs'}`,
      html: htmlReport,
    });
  }

  static async sendErrorReport(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await EmailService.sendEmail({
      to: 'nicolas@ritouet.com',
      subject: '[FFCAM] ❌ Erreur critique lors de la synchronisation',
      html: this.generateErrorReport(errorMessage),
    });
  }

  private static async logFormations(formations: Formation[]) {
    const stats = generateStats(formations);
    console.log('📋 FORMATIONS TROUVÉES :\n');
    console.log(stats);
  }

  private static generateHtmlReport({ 
    formations, succeeded, errors, duration 
  }: SyncResult & { stats: ReturnType<typeof generateStats> }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Rapport de synchronisation FFCAM</h1>
        
        ${this.generateSyncStatusSection(succeeded, formations.length, errors, duration)}






      </div>
    `;
  }
  //         ${this.generateStatsSection(stats)}
  // ${errors.length > 0 ? this.generateErrorsSection(errors) : ''}

  private static generateErrorReport(errorMessage: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Erreur critique de synchronisation FFCAM</h1>
        
        <div style="background-color: #fff1f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #991b1b; margin-top: 0;">Détails de l'erreur</h2>
          <pre style="background-color: #fee2e2; padding: 15px; border-radius: 4px; overflow-x: auto;">
            ${errorMessage}
          </pre>
        </div>
      </div>
    `;
  }

  private static generateSyncStatusSection(succeeded: number, total: number, errors: { reference: string; error: string }[], duration: number): string {
    return `
      <div style="background-color: ${errors.length === 0 ? '#ecfdf5' : '#fef2f2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: ${errors.length === 0 ? '#065f46' : '#991b1b'}; margin-top: 0;">
          ${errors.length === 0 ? '✅ Synchronisation réussie' : '⚠️ Synchronisation avec erreurs'}
        </h2>
        <p>
          <strong>Formations traitées :</strong> ${succeeded}/${total}<br>
          <strong>Durée :</strong> ${duration.toFixed(2)} secondes
        </p>
      </div>
    `;
  }
}