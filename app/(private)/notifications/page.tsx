import type { Metadata } from 'next';
import { FormationService } from '@/services/formation/formations.service';
import NotificationsForm from '@/components/features/notifications/NotificationsForm';
import { FormationRepository } from '@/repositories/FormationRepository';

const formationRepository = new FormationRepository();
const formationService = new FormationService(formationRepository);

export const metadata: Metadata = {
  title: 'Notifications | FFCAM Formations',
  description: 'Gérez vos préférences de notification pour les formations FFCAM',
};

export default async function NotificationsPage() {
  const disciplines = await formationService.getAllDisciplines();
  
  const formattedDisciplines = disciplines.map(discipline => ({
    id: discipline,
    label: discipline
  }));

  return (
    <NotificationsForm initialDisciplines={formattedDisciplines} />
  );
}