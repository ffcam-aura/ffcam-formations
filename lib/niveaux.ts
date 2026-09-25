import { logger } from "@/lib/logger";

/**
 * Niveau / type de stage, déduit de la référence FFCAM.
 *
 * La référence suit le format `AAAA FF SS NNN RR X OO`, par ex. `2027FCCOPPE84712` :
 * NNN (ici PPE) est le code du niveau. Les codes de discipline et de niveau peuvent
 * contenir des chiffres ou « * » (ex. `2027ESVFCI227701`, CI2 = initiateur 2e degré via ferrata).
 *
 * Correspondances établies à partir des titres FFCAM (141 formations du 25/09/2026) et
 * complétées sur ~750 formations en base sur 12 mois (revue de la PR #34). La FFCAM n'est
 * pas toujours cohérente entre code et titre (quelques PSP intitulés « Pratiquant INITIE »,
 * « Module Avenir Montagne » codé INI) : on se fie au code.
 *
 * Tout code absent de la table, ou référence illisible, est rangé dans « Autres formations »
 * (avec un warning côté serveur) pour ne jamais disparaître d'une recherche par niveau.
 */

export type NiveauOption = { value: string; label: string };

type Niveau = NiveauOption & { codes: readonly string[] };

export const NIVEAU_AUTRES = 'autres';

/** Dans l'ordre du cursus, pas par ordre alphabétique. */
export const NIVEAUX: readonly Niveau[] = [
  { value: 'pratiquant-initie', label: 'Pratiquant initié', codes: ['PIN', 'PIV'] }, // PIV : initié VTT
  { value: 'pratiquant-perfectionne', label: 'Pratiquant perfectionné', codes: ['PPE', 'PPV', 'RSS'] },
  { value: 'pratiquant-specialise', label: 'Pratiquant spécialisé', codes: ['PSP'] },
  { value: 'initiateur-1-formation', label: 'Initiateur 1er degré – formation', codes: ['INI'] },
  // CT1 : certification initiateur ski de randonnée nordique
  { value: 'initiateur-1-certification', label: 'Initiateur 1er degré – certification', codes: ['INT', 'CT1'] },
  // CI2 : formation initiateur 2e degré via ferrata
  { value: 'initiateur-2-formation', label: 'Initiateur 2e degré – formation', codes: ['IQI', 'CI2'] },
  { value: 'initiateur-2-certification', label: 'Initiateur 2e degré – certification', codes: ['IQT'] },
  // RFE : recyclage qualification grandes voies équipées
  { value: 'recyclage', label: 'Recyclage (initiateur, qualification)', codes: ['RIN', 'RFE'] },
  { value: 'ufc', label: 'Unité de formation commune (UFC)', codes: ['UFC'] },
  { value: 'animateur', label: 'Animateur', codes: ['ASP'] },
  { value: 'qualification', label: 'Qualifications (ouvreur, gestionnaire EPI…)', codes: ['FES', 'EPI'] },
  // Codes rencontrés en base mais non classés : rangés ici sans warning
  {
    value: NIVEAU_AUTRES,
    label: 'Autres formations',
    codes: ['PSC', 'FDI', 'SEC', 'UTA', 'USC', '801', 'UGV', 'RAN', 'FVF', 'IRQ', 'IVM', '708', 'UEV', 'UFA'],
  },
];

const NIVEAU_BY_CODE = new Map(NIVEAUX.flatMap(n => n.codes.map(code => [code, n.value] as const)));
const NIVEAU_VALUES = new Set(NIVEAUX.map(n => n.value));

const REFERENCE_PATTERN = /^\d{4}[A-Z*]{4}([A-Z0-9]{3})\d{5}$/;

const warned = new Set<string>();

/** Une seule alerte par code ou référence, et seulement côté serveur (sync, notifications). */
function warnOnce(key: string, message: string, data: Record<string, string>) {
  if (typeof window !== 'undefined' || warned.has(key)) return;
  warned.add(key);
  logger.warn(message, data);
}

/** Code niveau à 3 caractères (INI, INT, CI2…) ou null si la référence est inexploitable. */
export function getNiveauCodeFromReference(reference: string | null | undefined): string | null {
  const match = reference?.trim().toUpperCase().match(REFERENCE_PATTERN);
  return match ? match[1] : null;
}

/**
 * Niveau (valeur de NIVEAUX) d'une formation. Code inconnu ou référence illisible :
 * « Autres formations ». Référence absente : null.
 */
export function getNiveauFromReference(reference: string | null | undefined): string | null {
  const normalized = reference?.trim().toUpperCase();
  if (!normalized) return null;

  const code = getNiveauCodeFromReference(normalized);
  if (!code) {
    warnOnce(`ref:${normalized}`, 'Référence de stage illisible : niveau rangé dans « Autres formations »', { reference: normalized });
    return NIVEAU_AUTRES;
  }

  const niveau = NIVEAU_BY_CODE.get(code);
  if (!niveau) {
    warnOnce(`code:${code}`, 'Code niveau de stage inconnu : rangé dans « Autres formations »', { code, reference: normalized });
    return NIVEAU_AUTRES;
  }
  return niveau;
}

export function isKnownNiveau(value: string): boolean {
  return NIVEAU_VALUES.has(value);
}

export function getNiveauLabel(value: string): string {
  return NIVEAUX.find(n => n.value === value)?.label ?? value;
}

/** Tous les niveaux, dans l'ordre du cursus. */
export function getAllNiveauOptions(): NiveauOption[] {
  return NIVEAUX.map(({ value, label }) => ({ value, label }));
}

/** Niveaux effectivement présents dans une liste de formations, dans l'ordre du cursus. */
export function getNiveauOptionsFromFormations(formations: Array<{ reference: string }>): NiveauOption[] {
  const present = new Set(formations.map(f => getNiveauFromReference(f.reference)));
  return getAllNiveauOptions().filter(n => present.has(n.value));
}

/**
 * Garde les formations de l'un des niveaux demandés.
 * Une liste vide (ou absente) signifie « tous les niveaux ».
 */
export function filterFormationsByNiveaux<T extends { reference: string }>(
  formations: T[],
  niveaux: readonly string[] | null | undefined
): T[] {
  if (!niveaux || niveaux.length === 0) return formations;
  const wanted = new Set(niveaux);
  return formations.filter(f => {
    const niveau = getNiveauFromReference(f.reference);
    return niveau !== null && wanted.has(niveau);
  });
}
