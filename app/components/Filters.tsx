import { useState, useEffect } from "react";

type FiltersProps = {
  onFilterChange: (filters: {
    searchQuery: string;
    location: string;
    discipline: string;
    organisateur: string;
    startDate: string;
    endDate: string;
    availableOnly: boolean;
    showPastFormations: boolean;
  }) => void;
  locations: string[];
  disciplines: string[];
  organisateurs: string[];
  showPastFormations: boolean;
};

export default function Filters({
  onFilterChange,
  locations,
  disciplines,
  organisateurs,
  showPastFormations,
}: FiltersProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [selectedOrganisateur, setSelectedOrganisateur] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPast, setShowPast] = useState(showPastFormations);

  useEffect(() => {
    onFilterChange({
      searchQuery,
      location: selectedLocation,
      discipline: selectedDiscipline,
      organisateur: selectedOrganisateur,
      startDate,
      endDate,
      availableOnly: showAvailableOnly,
      showPastFormations: showPast,
    });
  }, [searchQuery, selectedLocation, selectedDiscipline, selectedOrganisateur, startDate, endDate, showAvailableOnly, showPast, onFilterChange]);

  return (
    <div className="border p-6 rounded-lg shadow-lg bg-white mb-6">
      {/* Barre de recherche principale et organisateur */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
          />
        </div>
        <div className="w-64">
          <select
            value={selectedOrganisateur}
            onChange={(e) => setSelectedOrganisateur(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Tous les organisateurs</option>
            {organisateurs.map((organisateur) => (
              <option key={organisateur} value={organisateur}>
                {organisateur}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Autres filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Toutes les disciplines</option>
            {disciplines.map((discipline) => (
              <option key={discipline} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Options supplémentaires */}
      <div className="space-y-3 border-t pt-4 text-neutral-dark">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
          />
          <span className="group-hover:text-gray-900 transition-colors">
            Places disponibles uniquement
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
          />
          <span className="group-hover:text-gray-900 transition-colors">
            Inclure les formations passées (à partir du 22 octobre 2024)
          </span>
        </label>
      </div>
    </div>
  );
}