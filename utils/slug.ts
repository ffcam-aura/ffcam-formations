import { Formation } from '@/types/formation';

/**
 * Normalise une chaîne pour créer un slug URL-friendly
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '') // Supprime les tirets en début et fin
    .replace(/--+/g, '-'); // Remplace les tirets multiples par un seul
}

/**
 * Génère un slug SEO-friendly pour une formation
 * Format: titre-lieu-reference
 * Exemple: stage-alpinisme-debutant-chamonix-24-ALP-0502
 */
export function generateFormationSlug(formation: Formation): string {
  const titleSlug = normalizeString(formation.titre).slice(0, 60);
  const locationSlug = normalizeString(formation.lieu).slice(0, 30);

  // La référence est déjà URL-safe
  const parts = [titleSlug, locationSlug, formation.reference]
    .filter(Boolean)
    .join('-');

  return parts;
}

/**
 * Extrait la référence depuis un slug
 * Le dernier segment après les tirets devrait être la référence
 */
export function extractReferenceFromSlug(slug: string): string | null {
  // Pattern pour matcher une référence de formation moderne (ex: 2025ESESRFE32701)
  // Format: 4 chiffres (année) + lettres + chiffres
  const modernReferencePattern = /\d{4}[A-Z]+\d+$/;
  const modernMatch = slug.match(modernReferencePattern);

  if (modernMatch) {
    return modernMatch[0];
  }

  // Pattern pour matcher une ancienne référence de formation (ex: 24-ALP-0502)
  const oldReferencePattern = /\d{2}-[A-Z]{3}-\d{4}$/;
  const oldMatch = slug.match(oldReferencePattern);

  if (oldMatch) {
    return oldMatch[0];
  }

  // Fallback: chercher le dernier segment qui ressemble à une référence
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];

  // Si le dernier segment ressemble à une référence (commence par des chiffres et contient des lettres)
  if (lastPart && /^\d{4}[A-Z]/.test(lastPart)) {
    return lastPart;
  }

  // Dernier fallback pour l'ancien format
  if (parts.length >= 3) {
    const lastThreeParts = parts.slice(-3).join('-');
    if (lastThreeParts.match(/^\d{2}-[A-Z]{3}-\d{4}$/)) {
      return lastThreeParts;
    }
  }

  return null;
}

/**
 * Génère l'URL complète pour une formation
 */
export function getFormationUrl(formation: Formation): string {
  const slug = generateFormationSlug(formation);
  return `/formation/${slug}`;
}

/**
 * Vérifie si un slug est valide
 */
export function isValidFormationSlug(slug: string): boolean {
  return extractReferenceFromSlug(slug) !== null;
}