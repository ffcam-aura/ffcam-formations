import { MetadataRoute } from 'next';
import { getCachedFormations, getCachedDisciplines } from '@/lib/cachedFormations';
import { generateFormationSlug } from '@/utils/slug';
import { logger } from '@/lib/logger';

// On garde le rendu dynamique (le sitemap n'est pas généré au build, ce qui
// évite toute dépendance à la base au moment du build). Les requêtes passent
// par le cache partagé : la base n'est donc touchée qu'une fois par jour, pas
// à chaque crawl de bot.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://formations.ffcam-aura.fr';

  // Pages statiques avec leurs priorités
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/notifications`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  try {
    // Récupérer toutes les disciplines disponibles (cache partagé)
    const disciplines = await getCachedDisciplines();

    const disciplinePages: MetadataRoute.Sitemap = disciplines.map(discipline => ({
      url: `${baseUrl}?discipline=${encodeURIComponent(discipline)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Récupérer toutes les formations pour créer les URLs individuelles
    const formations = await getCachedFormations();

    // Filtrer les formations futures uniquement
    const activeFormations = formations.filter(formation => {
      const lastDate = formation.dates[formation.dates.length - 1];
      return lastDate && new Date(lastDate) >= new Date();
    });

    const formationPages: MetadataRoute.Sitemap = activeFormations.map(formation => ({
      url: `${baseUrl}/formation/${generateFormationSlug(formation)}`,
      lastModified: new Date(formation.lastSeenAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...disciplinePages,
      ...formationPages.slice(0, 1000), // Limiter à 1000 formations pour éviter un sitemap trop gros
    ];
  } catch (error) {
    logger.error('Erreur lors de la génération du sitemap', error as Error);
    // Retourner au minimum les pages statiques en cas d'erreur
    return staticPages;
  }
}