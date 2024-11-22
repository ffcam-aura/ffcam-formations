import { FFCAMScraper } from '@/lib/scraper';
import { EmailService } from '@/services/email/email.service';
import { Formation } from '@/types/formation';
import util from 'util';
import { env } from '@/env.ts';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from './formations.service';

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

interface HtmlReportData {
    formations: Formation[];
    succeeded: number;
    errors: SyncError[];
    duration: number;
    stats: FormationStats;
}

export class SyncService {
    private static readonly BATCH_SIZE = 50;

    static async getLastSyncDate() {
        return formationService.getLastSync();
    }

    static async synchronize(): Promise<SyncResult> {
        const startTime = new Date();
        console.log('\n🔍 Démarrage du scraping des formations FFCAM...\n');

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
        console.log('\n💾 SYNCHRONISATION AVEC LA BASE DE DONNÉES:');
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
                console.error(`\n❌ Échec pour le lot ${Math.floor(i / this.BATCH_SIZE) + 1}:`, error);
                // Fallback : traitement individuel en cas d'échec du lot
                for (const formation of batch) {
                    try {
                        await formationService.upsertFormation(formation);
                        succeeded++;
                        process.stdout.write(`\r• Progression : ${succeeded}/${formations.length} formations synchronisées`);
                    } catch (formationError) {
                        console.error(`\n❌ Échec pour ${formation.reference}:`, formationError);
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

    static async sendSyncReport({ formations, succeeded, errors, duration }: SyncResult) {
        const formationStats = this.generateStats(formations);
        const htmlReport = this.generateHtmlReport({
            formations,
            succeeded,
            errors,
            duration,
            stats: formationStats
        });

        await EmailService.sendEmail({
            to: env.SYNC_NOTIFICATION_EMAIL,
            subject: `[FFCAM] ${errors.length === 0 ? '✅' : '⚠️'} Rapport de synchronisation`,
            html: htmlReport,
        });
    }

    static async sendErrorReport(error: unknown, formations: Formation[] = [], succeeded = 0) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        await EmailService.sendEmail({
            to: env.SYNC_NOTIFICATION_EMAIL,
            subject: '[FFCAM] ❌ Erreur critique lors de la synchronisation',
            html: this.generateErrorReport(errorMessage, formations, succeeded),
        });
    }

    private static async logFormations(formations: Formation[]) {
        console.log('📋 FORMATIONS TROUVÉES :\n');
        formations.forEach((f, index) => {
            console.log(`\n=== Formation ${index + 1}/${formations.length} ===`);
            console.log(util.inspect({
                reference: f.reference,
                titre: f.titre,
                dates: f.dates,
                lieu: f.lieu,
                discipline: f.discipline,
                placesRestantes: f.placesRestantes !== null ? f.placesRestantes : 'Non spécifié',
                tarif: f.tarif > 0 ? `${f.tarif}€` : 'Non spécifié',
            }, {
                depth: null,
                colors: true,
                maxArrayLength: null,
                compact: false
            }));
            console.log('─'.repeat(50));
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
        console.log(`\n📊 STATISTIQUES :`);
        console.log(`📋 Nombre total de formations : ${stats.total}`);
        console.log(`🎯 Disciplines uniques : ${stats.uniqueDisciplines}`);
        console.log(`📍 Lieux uniques : ${stats.uniqueLocations}`);
        console.log(`🎫 Places restantes totales : ${stats.placesRestantes.total} sur ${stats.placesRestantes.formations} formations`);
        console.log(`💶 Formations avec tarif : ${stats.tarifs.formations}/${stats.total}`);

        console.log('\n📊 DISTRIBUTION PAR DISCIPLINE :');
        Object.entries(stats.disciplines)
            .sort(([, a], [, b]) => b - a)
            .forEach(([discipline, count]) => {
                console.log(`📌 ${discipline}: ${count} formations`);
            });

        console.log(`\n📅 PÉRIODE COUVERTE : du ${stats.dateRange.min.toLocaleDateString('fr-FR')} au ${stats.dateRange.max.toLocaleDateString('fr-FR')}`);
    }

    private static generateHtmlReport(data: HtmlReportData): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h1 style="color: #2563eb;">📊 Rapport de synchronisation FFCAM</h1>
                ${this.generateSyncStatusSection(data.succeeded, data.formations.length, data.errors, data.duration)}
                ${this.generateStatsSection(data.stats)}
                ${data.errors.length > 0 ? this.generateErrorsSection(data.errors) : ''}
            </div>
        `;
    }

    private static generateSyncStatusSection(
        succeeded: number,
        total: number,
        errors: SyncError[],
        duration: number
    ): string {
        const isSuccess = errors.length === 0;
        return `
            <div style="background-color: ${isSuccess ? '#ecfdf5' : '#fef2f2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: ${isSuccess ? '#065f46' : '#991b1b'}; margin-top: 0;">
                    ${isSuccess ? '✅ Synchronisation réussie' : '⚠️ Synchronisation avec erreurs'}
                </h2>
                <p>
                    <strong>📊 Formations traitées :</strong> ${succeeded}/${total}<br>
                    <strong>⏱️ Durée :</strong> ${duration.toFixed(2)} secondes
                </p>
            </div>
        `;
    }

    private static generateStatsSection(stats: FormationStats): string {
        return `
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">📊 Statistiques</h3>
                <ul style="list-style: none; padding: 0;">
                    <li>📋 Nombre total de formations : ${stats.total}</li>
                    <li>📍 Lieux uniques : ${stats.uniqueLocations}</li>
                    <li>🎯 Disciplines : ${stats.uniqueDisciplines}</li>
                    <li>🎫 Places restantes : ${stats.placesRestantes.total}</li>
                </ul>

                <h4 style="color: #1e293b;">📊 Distribution par discipline :</h4>
                <ul style="list-style: none; padding: 0;">
                    ${Object.entries(stats.disciplines)
                        .sort(([, a], [, b]) => b - a)
                        .map(([discipline, count]) =>
                            `<li>📌 ${discipline}: ${count} formations</li>`
                        ).join('')}
                </ul>

                <p>
                    <strong>📅 Période couverte :</strong> du ${stats.dateRange.min.toLocaleDateString('fr-FR')} 
                    au ${stats.dateRange.max.toLocaleDateString('fr-FR')}
                </p>
            </div>
        `;
    }

    private static generateErrorsSection(errors: SyncError[]): string {
        return `
            <div style="background-color: #fff1f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #991b1b; margin-top: 0;">⚠️ Erreurs rencontrées</h3>
                <ul style="list-style: none; padding: 0;">
                    ${errors.map(error =>
                        `<li style="margin-bottom: 10px;">
                            <strong>❌ ${error.reference}</strong>: ${error.error}
                        </li>`
                    ).join('')}
                </ul>
            </div>
        `;
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
}