import { LayoutGrid, List } from "lucide-react";
import { sortOptions } from "@/lib/constants";

type FormationsToolbarProps = {
  formationCount: number;
  sortOption: string;
  setSortOption: (option: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
};

export function FormationsToolbar({
  formationCount,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode
}: FormationsToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-600">
        {formationCount} formation{formationCount > 1 ? 's' : ''} trouvée{formationCount > 1 ? 's' : ''}
      </p>

      <div className="flex items-center gap-2">
        <select
          onChange={(e) => setSortOption(e.target.value)}
          value={sortOption}
          className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="border rounded-lg overflow-hidden flex bg-white">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Vue grille"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Vue liste"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}