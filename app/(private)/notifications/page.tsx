import type { Metadata } from 'next';
import { FormationService } from '@/services/formation/formations.service';
import NotificationsForm from '@/components/features/notifications/NotificationsForm';
import { FormationRepository } from '@/repositories/FormationRepository';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const formationRepository = new FormationRepository();
const formationService = new FormationService(formationRepository);

export const metadata: Metadata = {
  title: 'Notifications | FFCAM Formations',
  description: 'Gérez vos préférences de notification pour les formations FFCAM',
};

export default async function NotificationsPage() {
  let disciplines: string[] = [];

  try {
    disciplines = await formationService.getAllDisciplines();
  } catch (error) {
    logger.error('Erreur lors de la récupération des disciplines', error as Error);
    // Utiliser des disciplines par défaut si la base n'est pas accessible
    disciplines = [];
  }

  const formattedDisciplines = disciplines.map(discipline => ({
    id: discipline,
    label: discipline
  }));

  return (
    <NotificationsForm initialDisciplines={formattedDisciplines} />
  );
}