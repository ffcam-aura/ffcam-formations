import * as cheerio from 'cheerio';
import { Formation } from '@/types/formation';
import { parseOrganisateur } from '@/utils/formation-parser';
import {
    extractText,
    parseDocuments,
    parseDates,
    parseTarif,
    parseEmail
} from '@/utils/formation-parser';

export class FFCAMScraper {
    private static BASE_URL = 'https://www.ffcam.fr/les-formations.html';

    private static async fetchPage(): Promise<string> {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch page: ${response.status}`);
            }
            return response.text();
        } catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }
    }

    private static parseFormation($: cheerio.Root, element: cheerio.Element): Formation {
        const $formation = $(element);

        const organisateur = extractText($formation, "Organisateur");

        const formation = {
            reference: extractText($formation, "Référence du stage"),
            titre: $formation.find('span.titre').text().trim(),
            dates: parseDates(extractText($formation, "Dates")),
            lieu: extractText($formation, "Lieu"),
            informationStagiaire: extractText($formation, "Information stagiaire"),
            nombreParticipants: parseInt(extractText($formation, "Nombre de participants").match(/\d+/)?.[0] || '0', 10),
            placesRestantes: extractText($formation, "Places restantes").match(/\d+/)?.[0]
                ? parseInt(extractText($formation, "Places restantes").match(/\d+/)?.[0] || '0', 10)
                : null,
            hebergement: extractText($formation, "Hébergement"),
            tarif: parseTarif(extractText($formation, "Tarifs")),
            discipline: extractText($formation, "Discipline"),
            organisateur: parseOrganisateur(organisateur),
            responsable: extractText($formation, "Responsable du stage"),
            emailContact: parseEmail($formation),
            documents: parseDocuments($formation),
            firstSeenAt: new Date().toISOString()
        };

        return formation;
    }

    public static async scrapeFormations(): Promise<Formation[]> {
        const html = await this.fetchPage();
        const $ = cheerio.load(html);

        const formations: Formation[] = [];
        $('.sectionfunction_info.article').each((_, element) => {
            try {
                const formation = this.parseFormation($, element);
                formations.push(formation);
            } catch (error) {
                console.error('Error parsing formation:', error);
            }
        });

        return formations;
    }
}
