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

  const handleReset = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedDiscipline("");
    setSelectedOrganisateur("");
    setStartDate("");
    setEndDate("");
    setShowAvailableOnly(false);
    setShowPast(showPastFormations);
  };

  return (
    <div className="border p-4 sm:p-6 rounded-lg shadow-lg bg-white mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Filtres de recherche</h2>

      {/* Barre de recherche principale et organisateur */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedOrganisateur}
            onChange={(e) => setSelectedOrganisateur(e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Toutes les disciplines</option>
            {disciplines.map((discipline) => (
              <option key={discipline} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Options supplémentaires */}
      <div className="space-y-2 sm:space-y-3 border-t pt-3 sm:pt-4 text-sm sm:text-base text-neutral-dark mb-4 sm:mb-6">
        <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
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

        <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
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

      {/* Bouton de réinitialisation */}
      <div className="flex justify-end border-t pt-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}