// app/notifications/page.tsx
import type { Metadata } from 'next';
import { FormationsService } from '@/services/formations.service';
import NotificationsForm from '@/components/features/notifications/NotificationsForm';

export const metadata: Metadata = {
  title: 'Notifications | FFCAM Formations',
  description: 'Gérez vos préférences de notification pour les formations FFCAM',
};

export default async function NotificationsPage() {
  const disciplines = await FormationsService.getAllDisciplines();
  
  const formattedDisciplines = disciplines.map(discipline => ({
    id: discipline,
    label: discipline
  }));

  return (
    <NotificationsForm initialDisciplines={formattedDisciplines} />
  );
}