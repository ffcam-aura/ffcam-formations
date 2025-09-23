import { Formation } from "@/types/formation";
import FormationCard from "@/components/features/formations/FormationCard";
import FormationRow from "@/components/features/formations/FormationRow";

interface FormationListProps {
  formations: Formation[];
  viewMode: 'grid' | 'list';
}

export default function FormationList({ formations, viewMode }: FormationListProps) {
  return (
    <>
      {viewMode === 'grid' ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <FormationCard key={formation.reference} formation={formation} />
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {formations.map((formation) => (
            <FormationRow key={formation.reference} formation={formation} />
          ))}
        </ul>
      )}
    </>
  );
}