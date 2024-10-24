import * as cheerio from 'cheerio';
import { FormationDocument } from '@/app/types/formation';


/**
 * Cette fonction prend une chaîne de texte en entrée, supprime les espaces multiples et les tabulations,
 * puis vérifie si une partie du texte est répétée (par exemple, si un organisateur est mentionné deux fois de suite).
 * Si une répétition est détectée, la fonction retourne la partie unique du texte. Sinon, elle renvoie le texte nettoyé.
 * 
 * @param text - La chaîne de texte à analyser (peut contenir des répétitions et des espaces superflus).
 * @returns La chaîne de texte sans doublons ni espaces multiples.
 */
export function parseOrganisateur(text: string): string {
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    const duplicatePattern = new RegExp(`^(.+?)\\s+\\1$`);
    const match = cleanedText.match(duplicatePattern);

    if (match) {
        return match[1];
    }

    return cleanedText;
}


// Fonction pour extraire un texte en fonction d'un label
export function extractText(el: cheerio.Cheerio, label: string): string {
    return el.find(`label:contains("${label}:")`).parent().text()
        .replace(`${label}:`, '').trim();
}

// Fonction pour parser des documents à partir de liens PDF dans une formation
export function parseDocuments($formation: cheerio.Cheerio): FormationDocument[] {
    const documents: FormationDocument[] = [];

    $formation.find('a[href^="/export/pdf/"]').each((_, element) => {
        const $link = cheerio.load(element);
        const url = $link('a').attr('href') || '';
        const nom = $link('a').text().trim().replace('PDF : ', '');

        if (url && nom) {
            let type = 'inscription';
            if (url.includes('cursus') || nom.toLowerCase().includes('cursus')) {
                type = 'cursus';
            }

            documents.push({
                type,
                nom,
                url: `https://www.ffcam.fr${url}`
            });
        }
    });

    return documents;
}

// Fonction pour parser les dates
export function parseDates(datesText: string): string[] {
    const dateRegex = /(\d{2}\/\d{2}\/\d{4})/g;
    return datesText.match(dateRegex) || [];
}

// Fonction pour parser les tarifs
export function parseTarif(tarifText: string): number {
    const match = tarifText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

// Fonction pour décrypter une adresse email encodée
export function getDecryptedEmailFromCharCodeArray(charCodes: number[]): string {
    const email = String.fromCharCode(...charCodes);
    const emailRegex = /mailto:([^"]+)/;
    const match = email.match(emailRegex);
    if (match && match[1]) {
        return match[1];
    }
    throw new Error("Impossible de trouver l'adresse email.");
}

// Fonction pour extraire et décrypter l'email
export function parseEmail($formation: cheerio.Cheerio): string | null {
    const scriptContent = $formation.find('script').text();

    const charCodeMatch = scriptContent.match(/String\.fromCharCode\((.*?)\)/);
    if (charCodeMatch) {
        const charCodes = charCodeMatch[1]
            .split(',')
            .map(code => parseInt(code.trim(), 10));

        try {
            return getDecryptedEmailFromCharCodeArray(charCodes);
        } catch (error) {
            console.error('Error decrypting email:', error);
            return null;
        }
    }

    const emailMatch = scriptContent.match(/mailto:(.*?)"/);
    return emailMatch ? emailMatch[1] : null;
}
