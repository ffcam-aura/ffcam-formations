import { useState } from "react";
import { Formation } from "@/app/types/formation";
import FormationCard from "./FormationCard";
import FormationRow from "./FormationRow";
import { LayoutGrid, List } from "lucide-react";

interface FormationListProps {
  formations: Formation[];
}

export default function FormationList({ formations }: FormationListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Vue grille"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Vue liste"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

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
    </div>
  );
}