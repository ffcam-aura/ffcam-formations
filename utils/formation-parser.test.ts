import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { extractText, formatName, getDecryptedEmailFromCharCodeArray, parseDates, parseDocuments, parseOrganisateur, parseTarif } from './formation-parser';

describe('Formation data parser', () => {
  it('should remove duplicated organizer names', () => {
    const testCases = [
      {
        input: "COMITE DEPARTEMENTAL SAVOIE COMITE DEPARTEMENTAL SAVOIE",
        expected: "COMITE DEPARTEMENTAL SAVOIE"
      },
      {
        input: "CLUB ALPIN FRANCAIS SAINT ETIENNE",
        expected: "CLUB ALPIN FRANCAIS SAINT ETIENNE"
      },
      {
        input: "COMITE REGIONAL AUVERGNE-RHONE-ALPES    COMITE REGIONAL AUVERGNE-RHONE-ALPES",
        expected: "COMITE REGIONAL AUVERGNE-RHONE-ALPES"
      },
      {
        // Avec tabulations
        input: "CLUB ALPIN FRANCAIS GRENOBLE\t\tCLUB ALPIN FRANCAIS GRENOBLE",
        expected: "CLUB ALPIN FRANCAIS GRENOBLE"
      },
      {
        // Textes différents
        input: "CLUB ALPIN FRANCAIS PARIS    CLUB ALPIN FRANCAIS MARSEILLE",
        expected: "CLUB ALPIN FRANCAIS PARIS CLUB ALPIN FRANCAIS MARSEILLE"
      },
      {
        // Avec espaces superflus
        input: "  CLUB   ALPIN   FRANCAIS      CLUB   ALPIN   FRANCAIS  ",
        expected: "CLUB ALPIN FRANCAIS"
      }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(parseOrganisateur(input)).toBe(expected);
    });
  });
  
  it('should correctly parse organisateur from HTML', () => {
    const html = `
      <div class="ffcam-formation">
        <div class="col2">
          <p>
            <label>Organisateur: </label>
            COMITE DEPARTEMENTAL SAVOIE COMITE DEPARTEMENTAL SAVOIE
          </p>
        </div>
      </div>
    `;
  
    const $ = cheerio.load(html);
    const organisateurText = $('.ffcam-formation p')
      .contents() // Get all nodes including text nodes
      .filter(function(this: cheerio.Node) {
        return this.type === 'text';
      })
      .text()
      .trim();

    const parsedOrganisateur = parseOrganisateur(organisateurText);

    expect(parsedOrganisateur).toBe("COMITE DEPARTEMENTAL SAVOIE");
  });

  it('should handle empty or invalid input', () => {
    expect(parseOrganisateur("")).toBe("");
    expect(parseOrganisateur("   ")).toBe("");
    expect(parseOrganisateur("\t\t")).toBe("");
  });
});

describe('formatName', () => {
  it('should handle basic names', () => {
    expect(formatName('jean dupont')).toBe('Jean Dupont');
    expect(formatName('MARIE CLAIRE')).toBe('Marie Claire');
    expect(formatName('pIeRrE dUpOnT')).toBe('Pierre Dupont');
  });

  it('should handle hyphenated names', () => {
    expect(formatName('jean-pierre')).toBe('Jean-Pierre');
    expect(formatName('MARIE-CLAIRE')).toBe('Marie-Claire');
  });

  it('should handle empty or invalid inputs', () => {
    expect(formatName('')).toBe('');
    expect(formatName(undefined as unknown as string)).toBe('');
    expect(formatName(null as unknown as string)).toBe('');
  });

  it('should handle multiple spaces and special characters', () => {
    expect(formatName('jean  pierre')).toBe('Jean Pierre');
    expect(formatName('o\'neil')).toBe('O\'Neil');
    expect(formatName('jean    paul')).toBe('Jean Paul');
  });
});

describe('parseOrganisateur', () => {
  it('should remove duplicate text', () => {
    expect(parseOrganisateur('Club Alpin Club Alpin')).toBe('Club Alpin');
    expect(parseOrganisateur('FFCAM FFCAM')).toBe('FFCAM');
  });

  it('should clean whitespace', () => {
    expect(parseOrganisateur('  Club   Alpin  ')).toBe('Club Alpin');
    expect(parseOrganisateur('FFCAM\t\tFFCAM')).toBe('FFCAM');
  });

  it('should handle non-duplicate text', () => {
    expect(parseOrganisateur('Club Alpin Français')).toBe('Club Alpin Français');
    expect(parseOrganisateur('FFCAM Lyon')).toBe('FFCAM Lyon');
  });
});

describe('parseDates', () => {
  it('should extract dates in DD/MM/YYYY format', () => {
    expect(parseDates('Date: 01/01/2024')).toEqual(['01/01/2024']);
    expect(parseDates('Du 01/01/2024 au 02/01/2024')).toEqual(['01/01/2024', '02/01/2024']);
    expect(parseDates('Pas de date')).toEqual([]);
  });

  it('should handle multiple dates with extra text', () => {
    const text = 'Formation du 01/01/2024 au 02/01/2024, rattrapage le 03/01/2024';
    expect(parseDates(text)).toEqual(['01/01/2024', '02/01/2024', '03/01/2024']);
  });
});

describe('parseTarif', () => {
  it('should extract numeric price', () => {
    expect(parseTarif('Prix: 100€')).toBe(100);
    expect(parseTarif('Tarif: 100 euros')).toBe(100);
    expect(parseTarif('100')).toBe(100);
  });

  it('should handle invalid formats', () => {
    expect(parseTarif('Gratuit')).toBe(0);
    expect(parseTarif('')).toBe(0);
    expect(parseTarif('Prix sur demande')).toBe(0);
  });
});

describe('parseEmail & getDecryptedEmailFromCharCodeArray', () => {
  it('should decrypt email from char codes', () => {
    const charCodes = 'mailto:test@example.com'.split('').map(c => c.charCodeAt(0));
    expect(getDecryptedEmailFromCharCodeArray(charCodes)).toBe('test@example.com');
  });

  it('should handle invalid char codes', () => {
    expect(() => getDecryptedEmailFromCharCodeArray([])).toThrow();
  });
});

describe('parseDocuments', () => {
  it('should parse PDF documents', () => {
    const html = `
      <div>
        <a href="/export/pdf/inscription.pdf">PDF : Fiche inscription</a>
        <a href="/export/pdf/cursus.pdf">PDF : Cursus formation</a>
      </div>
    `;
    const $ = cheerio.load(html);
    const docs = parseDocuments($('div'));

    expect(docs).toHaveLength(2);
    expect(docs[0]).toEqual({
      type: 'inscription',
      nom: 'Fiche inscription',
      url: 'https://www.ffcam.fr/export/pdf/inscription.pdf'
    });
    expect(docs[1].type).toBe('cursus');
  });

  it('should handle empty or invalid documents', () => {
    const $ = cheerio.load('<div></div>');
    expect(parseDocuments($('div'))).toEqual([]);
  });
});

// Test helper pour cheerio
describe('extractText', () => {
  it('should extract text after label', () => {
    const html = '<div><label>Name:</label> John Doe</div>';
    const $ = cheerio.load(html);
    expect(extractText($('div'), 'Name')).toBe('John Doe');
  });
});