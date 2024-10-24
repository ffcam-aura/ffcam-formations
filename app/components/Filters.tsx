import { useState, useEffect } from "react";

type FiltersProps = {
  onFilterChange: (filters: { searchQuery: string; location: string; discipline: string; startDate: string; endDate: string; availableOnly: boolean; showPastFormations: boolean }) => void;
  locations: string[];
  disciplines: string[];
  showPastFormations: boolean;  // Recevoir la nouvelle option
};

export default function Filters({ onFilterChange, locations, disciplines, showPastFormations }: FiltersProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPast, setShowPast] = useState(showPastFormations);  // Nouveau état pour la case à cocher

  // Utiliser useEffect pour déclencher handleFilterChange à chaque fois que l'un des filtres change
  useEffect(() => {
    onFilterChange({
      searchQuery,
      location: selectedLocation,
      discipline: selectedDiscipline,
      startDate,
      endDate,
      availableOnly: showAvailableOnly,
      showPastFormations: showPast,
    });
  }, [searchQuery, selectedLocation, selectedDiscipline, startDate, endDate, showAvailableOnly, showPast, onFilterChange]);

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 rounded-lg shadow-md">
      <div className="col-span-1">
        <label className="block mb-2 text-neutral-dark font-semibold">Recherche (Titre ou Description)</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-neutral-light rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
          placeholder="Rechercher..."
        />
      </div>
      <div>
        <label className="block mb-2 text-neutral-dark font-semibold">Lieux</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="p-2 border border-neutral-light rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
        >
          <option value="">Tous les lieux</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
      </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2 text-neutral-dark font-semibold">Disciplines</label>
        <select
          value={selectedDiscipline}
          onChange={(e) => setSelectedDiscipline(e.target.value)}
          className="p-2 border border-neutral-light rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
        >
          <option value="">Toutes les disciplines</option>
          {disciplines.map((discipline) => (
            <option key={discipline} value={discipline}>
              {discipline}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2 text-neutral-dark font-semibold">Date de début</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border border-neutral-light rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
        />
      </div>
      <div>
        <label className="block mb-2 text-neutral-dark font-semibold">Date de fin</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border border-neutral-light rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
        />
      </div>
      <div className="flex items-center mt-6">
        <input
          type="checkbox"
          checked={showAvailableOnly}
          onChange={(e) => setShowAvailableOnly(e.target.checked)}
          className="mr-2 focus:ring-primary"
        />
        <label className="text-neutral-dark font-semibold">Afficher uniquement les formations avec des places disponibles</label>
      </div>
      <div className="flex items-center mt-6">
        <input
          type="checkbox"
          checked={showPast}
          onChange={(e) => setShowPast(e.target.checked)}
          className="mr-2 focus:ring-primary"
        />
        <label className="text-neutral-dark font-semibold">Afficher les formations passées</label>
      </div>
    </div>
  );
}
