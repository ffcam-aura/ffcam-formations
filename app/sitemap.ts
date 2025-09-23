import { MetadataRoute } from 'next';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from '@/services/formation/formations.service';

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

    // Récupérer toutes les formations pour extraire les lieux uniques
    const formations = await formationService.getAllFormations();
    const lieuxSet = new Set<string>();

    formations.forEach(formation => {
      if (formation.lieu && formation.lieu.trim() !== '') {
        lieuxSet.add(formation.lieu);
      }
    });

    const lieux = Array.from(lieuxSet).sort();

    const lieuPages: MetadataRoute.Sitemap = lieux
      .filter(lieu => lieu && lieu.trim() !== '')
      .map(lieu => ({
        url: `${baseUrl}?lieu=${encodeURIComponent(lieu)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }));

    return [
      ...staticPages,
      ...disciplinePages,
      ...lieuPages,
    ];
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    // Retourner au minimum les pages statiques en cas d'erreur
    return staticPages;
  }
}