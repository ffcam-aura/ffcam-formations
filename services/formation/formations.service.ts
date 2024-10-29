import { Formation } from "@/types/formation";
import { IFormationRepository } from "@/repositories/FormationRepository";

export class FormationService {
    constructor(private formationRepository: IFormationRepository) {}

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

    async upsertFormation(formation: Formation): Promise<void> {
        try {
            const formationWithParsedDates = {
                ...formation,
                dates: formation.dates.map(date => this.parseDate(date).toISOString())
            };
            await this.formationRepository.upsertFormation(formationWithParsedDates);
        } catch (error) {
            console.error(`Error upserting formation ${formation.reference}:`, error);
            throw error;
        }
    }

    async getLastSync(): Promise<Date | null> {
        return await this.formationRepository.getLastSync();
    }

    async getFormationByReference(reference: string): Promise<Formation | null> {
        return await this.formationRepository.findFormationByReference(reference);
    }

    async getAllFormations(): Promise<Formation[]> {
        return await this.formationRepository.findAllFormations();
    }

    async getAllDisciplines(): Promise<string[]> {
        try {
            return await this.formationRepository.findAllDisciplines();
        } catch (error) {
            console.error('Error getting disciplines:', error);
            throw error;
        }
    }

    async getRecentFormations(hours: number): Promise<Formation[]> {
        try {
            return await this.formationRepository.findRecentFormations(hours);
        } catch (error) {
            console.error('Error getting recent formations:', error);
            throw error;
        }
    }
}