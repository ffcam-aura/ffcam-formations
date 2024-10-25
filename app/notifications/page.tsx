// app/notifications/page.tsx
import type { Metadata } from 'next';
import { FormationsService } from '@/app/services/formations.service';
import Preference from '@/app/components/Preference';

export const metadata: Metadata = {
  title: 'Notifications | FFCAM Formations',
  description: 'Gérez vos préférences de notification pour les formations FFCAM',
};

export default async function NotificationsPage() {
  const disciplines = await FormationsService.getAllDisciplines();
  
  const formattedDisciplines = disciplines.map(discipline => ({
    id: discipline,
    label: discipline,
    description: `Formations en ${discipline.toLowerCase()}`
  }));

  return (
    <Preference initialDisciplines={formattedDisciplines} />
  );
}