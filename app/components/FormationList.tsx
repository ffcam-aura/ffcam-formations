import { Formation } from "@/app/types/formation";
import FormationCard from "./FormationCard";
import FormationRow from "./FormationRow";

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
        <div>
          <div className="hidden md:grid grid-cols-7 gap-4 px-4 py-2 bg-gray-100 rounded-t-lg font-medium text-sm text-gray-600 border-b">
            <div className="col-span-2">Formation</div>
            <div>Lieu</div>
            <div>Date</div>
            <div>Prix</div>
            <div>Places</div>
            <div>Discipline</div>
          </div>
          <ul className="space-y-4 mt-4">
            {formations.map((formation) => (
              <FormationRow key={formation.reference} formation={formation} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}