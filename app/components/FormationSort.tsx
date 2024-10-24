const sortOptions = [
    { value: 'date-asc', label: 'Date (plus ancien)' },
    { value: 'date', label: 'Date (plus récent)' },
    { value: 'price', label: 'Prix (croissant)' },
    { value: 'price-desc', label: 'Prix (décroissant)' },
    { value: 'title', label: 'Titre (A-Z)' },
    { value: 'location', label: 'Lieu (A-Z)' }
  ];
  
  type SortOption =  'date-asc' | 'date' | 'price' | 'price-desc' | 'title' | 'location';
  
  export function FormationSort({ onSort }: { onSort: (option: SortOption) => void }) {
    return (
      <div className="flex justify-end mb-4">
        <select
          onChange={(e) => onSort(e.target.value as SortOption)}
          className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }