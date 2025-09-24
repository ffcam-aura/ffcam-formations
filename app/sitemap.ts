import { MetadataRoute } from 'next';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from '@/services/formation/formations.service';
import { generateFormationSlug } from '@/utils/slug';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

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
    // Récupérer dynamiquement toutes les formations
    const formationRepository = new FormationRepository();
    const formationService = new FormationService(formationRepository);

    // Récupérer toutes les disciplines disponibles
    const disciplines = await formationService.getAllDisciplines();

    const disciplinePages: MetadataRoute.Sitemap = disciplines.map(discipline => ({
      url: `${baseUrl}?discipline=${encodeURIComponent(discipline)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Récupérer toutes les formations pour créer les URLs individuelles
    const formations = await formationService.getAllFormations();

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