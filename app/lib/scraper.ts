import * as cheerio from 'cheerio';
import { Formation, formationSchema } from '@/app/types/formation'

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

  private static extractText(el: cheerio.Cheerio, label: string): string {
    return el.find(`label:contains("${label}:")`).parent().text()
      .replace(`${label}:`, '').trim();
  }

  private static parseFormation($: cheerio.CheerioAPI, element: cheerio.Element): Formation {
    const $formation = $(element);

    const formation = {
      reference: this.extractText($formation, "Référence du stage"),
      titre: $formation.find('span.titre').text().trim(),
      dates: this.parseDates(this.extractText($formation, "Dates")),
      lieu: this.extractText($formation, "Lieu"),
      informationStagiaire: this.extractText($formation, "Information stagiaire"),
      nombreParticipants: parseInt(this.extractText($formation, "Nombre de participants").match(/\d+/)?.[0] || '0', 10),
      placesRestantes: this.extractText($formation, "Places restantes").match(/\d+/)?.[0] 
        ? parseInt(this.extractText($formation, "Places restantes").match(/\d+/)?.[0] || '0', 10) 
        : null,
      hebergement: this.extractText($formation, "Hébergement"),
      tarif: this.parseTarif(this.extractText($formation, "Tarifs")),
      discipline: this.extractText($formation, "Discipline"),
      organisateur: this.extractText($formation, "Organisateur"),
      responsable: this.extractText($formation, "Responsable du stage"),
      emailContact: this.parseEmail($formation),
    };

    return formationSchema.parse(formation);
  }

  private static parseDates(datesText: string): string[] {
    const dateRegex = /(\d{2}\/\d{2}\/\d{4})/g;
    return datesText.match(dateRegex) || [];
  }

  private static parseTarif(tarifText: string): number {
    const match = tarifText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private static parseEmail($formation: cheerio.Cheerio): string | null {
    // Extraire l'email depuis le script JavaScript encodé
    const scriptContent = $formation.find('script').text();
    const emailMatch = scriptContent.match(/mailto:(.*?)"/);
    return emailMatch ? emailMatch[1] : null;
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