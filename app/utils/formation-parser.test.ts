import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { parseOrganisateur } from './formation-parser';

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

      console.log(organisateurText);
  
    const parsedOrganisateur = parseOrganisateur(organisateurText);

    console.log(parsedOrganisateur);
    expect(parsedOrganisateur).toBe("COMITE DEPARTEMENTAL SAVOIE");
  });

  it('should handle empty or invalid input', () => {
    expect(parseOrganisateur("")).toBe("");
    expect(parseOrganisateur("   ")).toBe("");
    expect(parseOrganisateur("\t\t")).toBe("");
  });
});