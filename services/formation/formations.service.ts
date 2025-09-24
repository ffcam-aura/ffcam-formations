import { Formation } from "@/types/formation";
import { IFormationRepository } from "@/repositories/FormationRepository";
import { logger } from "@/lib/logger";

export class FormationService {
    private static readonly BATCH_SIZE = 50;

    constructor(private formationRepository: IFormationRepository) {}

    /**
     * Convertit une chaîne de date au format FR en Date
     */
    private parseDate(dateStr: string | Date): Date {
        if (dateStr instanceof Date) {
            return dateStr;
        }

        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(`${year}-${month}-${day}`);
        }

        return new Date(dateStr);
    }

    /**
     * Met à jour ou crée un lot de formations
     */
    async upsertFormations(formations: Formation[]): Promise<void> {
        try {
            // Traiter les formations par lots pour éviter les timeouts
            for (let i = 0; i < formations.length; i += FormationService.BATCH_SIZE) {
                const batch = formations.slice(i, i + FormationService.BATCH_SIZE);
                const formationsWithParsedDates = batch.map(formation => ({
                    ...formation,
                    dates: formation.dates.map(date => this.parseDate(date).toISOString())
                }));

                await this.formationRepository.upsertFormations(formationsWithParsedDates);
            }
        } catch (error) {
            logger.error('Error upserting formations batch', error as Error, { batchSize: formations.length });
            throw error;
        }
    }

    /**
     * Met à jour ou crée une formation individuelle
     * Conservé pour la compatibilité et le fallback
     */
    async upsertFormation(formation: Formation): Promise<void> {
        try {
            const formationWithParsedDates = {
                ...formation,
                dates: formation.dates.map(date => this.parseDate(date).toISOString())
            };
            await this.formationRepository.upsertFormation(formationWithParsedDates);
        } catch (error) {
            logger.error('Error upserting formation', error as Error, { reference: formation.reference });
            throw error;
        }
    }

    /**
     * Récupère la date de la dernière synchronisation
     */
    async getLastSync(): Promise<Date | null> {
        try {
            return await this.formationRepository.getLastSync();
        } catch (error) {
            logger.error('Error getting last sync date', error as Error);
            throw error;
        }
    }

    /**
     * Récupère une formation par sa référence
     */
    async getFormationByReference(reference: string): Promise<Formation | null> {
        try {
            return await this.formationRepository.findFormationByReference(reference);
        } catch (error) {
            logger.error('Error getting formation by reference', error as Error, { reference });
            throw error;
        }
    }

    /**
     * Récupère toutes les formations
     */
    async getAllFormations(): Promise<Formation[]> {
        try {
            return await this.formationRepository.findAllFormations();
        } catch (error) {
            logger.error('Error getting all formations', error as Error);
            throw error;
        }
    }

    /**
     * Récupère toutes les disciplines distinctes
     */
    async getAllDisciplines(): Promise<string[]> {
        try {
            return await this.formationRepository.findAllDisciplines();
        } catch (error) {
            logger.error('Error getting disciplines', error as Error);
            throw error;
        }
    }

    /**
     * Récupère les formations récentes
     * @param hours Nombre d'heures à remonter
     */
    async getRecentFormations(hours: number): Promise<Formation[]> {
        try {
            return await this.formationRepository.findRecentFormations(hours);
        } catch (error) {
            logger.error('Error getting recent formations', error as Error, { hours });
            throw error;
        }
    }

    /**
     * Vérifie si une formation existe déjà
     */
    async isFormationExists(reference: string): Promise<boolean> {
        try {
            const formation = await this.getFormationByReference(reference);
            return formation !== null;
        } catch (error) {
            logger.error('Error checking formation existence', error as Error, { reference });
            throw error;
        }
    }

    /**
     * Récupère les formations ayant des places disponibles
     */
    async getAvailableFormations(): Promise<Formation[]> {
        try {
            const allFormations = await this.getAllFormations();
            return allFormations.filter(f => 
                f.placesRestantes !== null && 
                f.placesRestantes > 0 &&
                f.dates.some(date => new Date(date) > new Date())
            );
        } catch (error) {
            logger.error('Error getting available formations', error as Error);
            throw error;
        }
    }

    /**
     * Récupère les formations par discipline
     */
    async getFormationsByDiscipline(discipline: string): Promise<Formation[]> {
        try {
            const allFormations = await this.getAllFormations();
            return allFormations.filter(f => f.discipline === discipline);
        } catch (error) {
            logger.error('Error getting formations for discipline', error as Error, { discipline });
            throw error;
        }
    }

    /**
     * Récupère les formations par lieu
     */
    async getFormationsByLocation(location: string): Promise<Formation[]> {
        try {
            const allFormations = await this.getAllFormations();
            return allFormations.filter(f => f.lieu === location);
        } catch (error) {
            logger.error('Error getting formations for location', error as Error, { location });
            throw error;
        }
    }

    /**
     * Récupère les formations dans une plage de dates
     */
    async getFormationsByDateRange(startDate: Date, endDate: Date): Promise<Formation[]> {
        try {
            const allFormations = await this.getAllFormations();
            return allFormations.filter(f => 
                f.dates.some(date => {
                    const formationDate = new Date(date);
                    return formationDate >= startDate && formationDate <= endDate;
                })
            );
        } catch (error) {
            logger.error('Error getting formations by date range', error as Error, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            throw error;
        }
    }
}