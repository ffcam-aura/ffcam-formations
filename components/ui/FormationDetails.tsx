import { formatName } from '@/utils/formation-parser';

export function FormationInfoRow({
  icon,
  label,
  children,
  className = ''
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start sm:items-center ${className}`}>
      <span className="w-4 mr-2 flex-shrink-0 mt-1 sm:mt-0">{icon}</span>
      <div className="flex flex-col sm:flex-row sm:items-center flex-1">
        <strong className="w-16 flex-shrink-0">{label}</strong>
        {children}
      </div>
    </div>
  );
}

export function FormationLocation({ lieu }: { lieu: string }) {
  return <span>{lieu}</span>;
}

export function FormationDiscipline({ discipline }: { discipline: string }) {
  return <span>{discipline}</span>;
}

export function FormationPrice({ tarif }: { tarif: number }) {
  return <span>{tarif}€</span>;
}

export function FormationPlaces({
  placesRestantes,
  nombreParticipants
}: {
  placesRestantes: number | null;
  nombreParticipants: number;
}) {
  if (placesRestantes !== null) {
    return <span>{placesRestantes}</span>;
  }
  return <span>{nombreParticipants} participants max</span>;
}

export function FormationOrganizer({ organisateur }: { organisateur: string }) {
  return <span className="lowercase">{organisateur}</span>;
}

export function FormationResponsible({ responsable }: { responsable: string }) {
  return <span>{formatName(responsable)}</span>;
}

export function FormationAccommodation({ hebergement }: { hebergement: string }) {
  if (!hebergement) return null;
  return <span>{hebergement}</span>;
}