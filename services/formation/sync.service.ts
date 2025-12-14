import { FFCAMScraper } from '@/lib/scraper';
import { EmailService } from '@/services/email/email.service';
import { Formation } from '@/types/formation';
import { env } from '@/env';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from './formations.service';
import { logger } from '@/lib/logger';

const formationRepository = new FormationRepository();
const formationService = new FormationService(formationRepository);

interface SyncError {
    reference: string;
    error: string;
}

interface SyncStats {
    total: number;
    synchronized: number;
    errors: number;
    duration: string;
}

interface FormationStats {
    total: number;
    uniqueDisciplines: number;
    uniqueLocations: number;
    placesRestantes: {
        total: number;
        formations: number;
    };
    tarifs: {
        formations: number;
    };
    disciplines: Record<string, number>;
    dateRange: {
        min: Date;
        max: Date;
    };
}

interface SyncResult {
    formations: Formation[];
    succeeded: number;
    errors: SyncError[];
    duration: number;
    stats: SyncStats;
}

export class SyncService {
    private static readonly BATCH_SIZE = 50;

    static async getLastSyncDate() {
        return formationService.getLastSync();
    }

    static async synchronize(): Promise<SyncResult> {
        const startTime = new Date();
        logger.info('Démarrage du scraping des formations FFCAM');

        try {
            const formations = await FFCAMScraper.scrapeFormations();
            // await this.logFormations(formations);

            const { succeeded, errors } = await this.syncFormations(formations);

            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;

            const result = {
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

            return result;
        } catch (error) {
            throw error;
        }
    }

    private static async syncFormations(formations: Formation[]) {
        logger.info('Début de la synchronisation avec la base de données', { total: formations.length });
        let succeeded = 0;
        const errors: SyncError[] = [];

        // Traiter les formations par lots
        for (let i = 0; i < formations.length; i += this.BATCH_SIZE) {
            const batch = formations.slice(i, i + this.BATCH_SIZE);
            try {
                await formationService.upsertFormations(batch);
                succeeded += batch.length;
                process.stdout.write(`\r• Progression : ${succeeded}/${formations.length} formations synchronisées`);
            } catch (error) {
                logger.error('Erreur synchronisation lot', error as Error, {
                    batchNumber: Math.floor(i / this.BATCH_SIZE) + 1,
                    batchSize: batch.length
                });
                // Fallback : traitement individuel en cas d'échec du lot
                for (const formation of batch) {
                    try {
                        await formationService.upsertFormation(formation);
                        succeeded++;
                        process.stdout.write(`\r• Progression : ${succeeded}/${formations.length} formations synchronisées`);
                    } catch (formationError) {
                        logger.error('Erreur synchronisation formation', formationError as Error, {
                            reference: formation.reference
                        });
                        errors.push({
                            reference: formation.reference,
                            error: formationError instanceof Error ? formationError.message : String(formationError)
                        });
                    }
                }
            }
        }

        return { succeeded, errors };
    }

    static async sendErrorReport(error: unknown, formations: Formation[] = [], succeeded = 0) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        await EmailService.sendEmail({
            to: env.SYNC_NOTIFICATION_EMAIL,
            subject: '[FFCAM] ❌ Erreur critique lors de la synchronisation',
            html: this.generateErrorReport(errorMessage, formations, succeeded),
        });
    }

    static async sendPartialErrorReport(syncResult: SyncResult): Promise<void> {
        if (syncResult.errors.length === 0) return;

        await EmailService.sendEmail({
            to: env.SYNC_NOTIFICATION_EMAIL,
            subject: `[FFCAM] ⚠️ Sync terminé avec ${syncResult.errors.length} erreur(s)`,
            html: this.generatePartialErrorReport(syncResult),
        });
    }

    /**
     * Ping healthcheck service (dead man's switch pattern)
     * Signals success or failure to an external monitoring service like healthchecks.io
     */
    static async pingHealthcheck(success: boolean, message?: string): Promise<void> {
        const baseUrl = env.HEALTHCHECK_SYNC_URL;
        if (!baseUrl) {
            logger.info('Healthcheck URL not configured, skipping ping');
            return;
        }

        const url = success ? baseUrl : `${baseUrl}/fail`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: message,
                signal: AbortSignal.timeout(10000), // 10s timeout
            });

            if (!response.ok) {
                logger.warn('Healthcheck ping failed', { status: response.status, url });
            } else {
                logger.info('Healthcheck ping successful', { success, url });
            }
        } catch (error) {
            // Don't throw - healthcheck failure shouldn't break the sync
            logger.warn('Failed to ping healthcheck', { error: error instanceof Error ? error.message : String(error) });
        }
    }

    private static async logFormations(formations: Formation[]) {
        logger.info('Formations trouvées', {
            total: formations.length,
            formations: formations.map((f, index) => ({
                index: index + 1,
                reference: f.reference,
                titre: f.titre,
                dates: f.dates,
                lieu: f.lieu,
                discipline: f.discipline,
                placesRestantes: f.placesRestantes !== null ? f.placesRestantes : 'Non spécifié',
                tarif: f.tarif > 0 ? `${f.tarif}€` : 'Non spécifié',
            }))
        });

        const stats = this.generateStats(formations);
        this.logStats(stats);
    }

    private static generateStats(formations: Formation[]): FormationStats {
        const disciplineStats = formations.reduce((acc, f) => {
            acc[f.discipline] = (acc[f.discipline] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const formationsAvecPlaces = formations.filter(f => f.placesRestantes !== null);
        const placesTotales = formationsAvecPlaces.reduce((acc, f) => acc + (f.placesRestantes || 0), 0);

        const formationsAvecTarif = formations.filter(f => f.tarif > 0);

        const dates = formations.flatMap(f => f.dates).map(d => new Date(d.split('/').reverse().join('-')));

        return {
            total: formations.length,
            uniqueDisciplines: new Set(formations.map(f => f.discipline)).size,
            uniqueLocations: new Set(formations.map(f => f.lieu)).size,
            placesRestantes: {
                total: placesTotales,
                formations: formationsAvecPlaces.length
            },
            tarifs: {
                formations: formationsAvecTarif.length
            },
            disciplines: disciplineStats,
            dateRange: {
                min: new Date(Math.min(...dates.map(d => d.getTime()))),
                max: new Date(Math.max(...dates.map(d => d.getTime())))
            }
        };
    }

    private static logStats(stats: FormationStats) {
        logger.info('Statistiques de synchronisation', {
            total: stats.total,
            disciplinesUniques: stats.uniqueDisciplines,
            lieuxUniques: stats.uniqueLocations,
            placesRestantes: {
                total: stats.placesRestantes.total,
                formations: stats.placesRestantes.formations
            },
            formationsAvecTarif: stats.tarifs.formations,
            distributionParDiscipline: Object.entries(stats.disciplines)
                .sort(([, a], [, b]) => b - a)
                .reduce((acc, [discipline, count]) => ({
                    ...acc,
                    [discipline]: count
                }), {}),
            periodeCouverte: {
                debut: stats.dateRange.min.toLocaleDateString('fr-FR'),
                fin: stats.dateRange.max.toLocaleDateString('fr-FR')
            }
        });
    }

    private static generateErrorReport(errorMessage: string, formations: Formation[] = [], succeeded = 0): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h1 style="color: #dc2626;">❌ Erreur critique de synchronisation FFCAM</h1>

                <div style="background-color: #fff1f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #991b1b; margin-top: 0;">⚠️ Détails de l'erreur</h2>
                    <pre style="background-color: #fee2e2; padding: 15px; border-radius: 4px; overflow-x: auto;">
                        ${errorMessage}
                    </pre>
                </div>

                ${formations.length > 0 ? `
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1e293b; margin-top: 0;">ℹ️ État avant l'erreur</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li>📊 Formations récupérées : ${formations.length}</li>
                            <li>✅ Formations synchronisées : ${succeeded}</li>
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    private static generatePartialErrorReport(syncResult: SyncResult): string {
        const errorsList = syncResult.errors
            .map(e => `<li><strong>${e.reference}</strong>: ${e.error}</li>`)
            .join('\n');

        return `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h1 style="color: #d97706;">⚠️ Synchronisation FFCAM terminée avec erreurs</h1>

                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1e293b; margin-top: 0;">📊 Résumé</h2>
                    <ul style="list-style: none; padding: 0;">
                        <li>✅ Formations synchronisées : ${syncResult.succeeded}/${syncResult.formations.length}</li>
                        <li>❌ Erreurs : ${syncResult.errors.length}</li>
                        <li>⏱️ Durée : ${syncResult.duration.toFixed(1)}s</li>
                    </ul>
                </div>

                <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #92400e; margin-top: 0;">❌ Formations en erreur</h2>
                    <ul style="color: #78350f;">
                        ${errorsList}
                    </ul>
                </div>
            </div>
        `;
    }
}