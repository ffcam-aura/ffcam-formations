"use client"; // Indique que ce composant est un composant client

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns"; // Utilisé pour formater les dates

type Formation = {
  reference: string;
  titre: string;
  dates: string[];
  lieu: string;
  informationStagiaire: string;
  nombreParticipants: number;
  placesRestantes: number | null;
  hebergement: string;
  tarif: number;
  discipline: string;
  organisateur: string;
  responsable: string;
  emailContact: string | null;
};

export default function Home() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour chaque champ de filtre
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(""); // Stocke la date de début
  const [endDate, setEndDate] = useState<string>(""); // Stocke la date de fin

  // Récupérer toutes les valeurs possibles pour les lieux et disciplines
  const [locations, setLocations] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch("/api/formations");
        const data = await response.json();
        setFormations(data);
        setFilteredFormations(data);

        // Extraire les lieux et disciplines uniques pour les dropdowns
        const uniqueLocations: string[] = Array.from(new Set(data.map((f: Formation) => f.lieu)));
        const uniqueDisciplines: string[] = Array.from(new Set(data.map((f: Formation) => f.discipline)));
  
        setLocations(uniqueLocations);
        setDisciplines(uniqueDisciplines);
      } catch (error) {
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  // Fonction de filtrage par champs individuels
  const filterFormations = () => {
    const filtered = formations.filter((formation) => {
      const hasAvailablePlaces = showAvailableOnly
        ? formation.placesRestantes !== null && formation.placesRestantes > 0
        : true;
      const isInLocation = selectedLocation ? formation.lieu === selectedLocation : true;
      const isInDiscipline = selectedDiscipline ? formation.discipline === selectedDiscipline : true;
      
      // Filtrer par dates
      const isInDateRange = startDate && endDate
        ? formation.dates.some((date) => {
            const formationDate = parseISO(date); // Convertir la date
            return formationDate >= new Date(startDate) && formationDate <= new Date(endDate);
          })
        : true;

      return hasAvailablePlaces && isInLocation && isInDiscipline && isInDateRange;
    });

    setFilteredFormations(filtered);
  };

  // Appeler `filterFormations` chaque fois qu'un filtre change
  useEffect(() => {
    filterFormations();
  }, [showAvailableOnly, selectedLocation, selectedDiscipline, startDate, endDate]);

  const formatDate = (dateString: string) => {
    const parsedDate = parseISO(dateString);
    return format(parsedDate, "dd/MM/yyyy");
  };

  if (loading) {
    return <div>Loading formations...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-2xl font-bold">Formations FFCAM</h1>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:underline">Accueil</a></li>
            <li><a href="#" className="hover:underline">A propos</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="flex-grow container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-4 text-center">Découvrez nos formations</h2>
        <p className="text-center mb-8">
          Utilisez les filtres ci-dessous pour affiner votre recherche par lieu, discipline ou disponibilité.
        </p>

        {/* Filtres */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2">Lieux</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="p-2 border rounded w-full"
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
            <label className="block mb-2">Disciplines</label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="p-2 border rounded w-full"
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
            <label className="block mb-2">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-2">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="mr-2"
            />
            <label>Afficher uniquement les formations avec des places disponibles</label>
          </div>
        </div>

        {/* Liste des formations */}
        {filteredFormations.length === 0 ? (
          <p className="text-center">Aucune formation disponible correspondant à vos critères.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((formation) => (
              <li key={formation.reference} className="border p-4 rounded shadow">
                <h3 className="text-xl font-semibold mb-2">{formation.titre}</h3>
                <p><strong>Lieu :</strong> {formation.lieu}</p>
                <p><strong>Discipline :</strong> {formation.discipline}</p>
                <p><strong>Tarif :</strong> {formation.tarif}€</p>
                <p><strong>Organisateur :</strong> {formation.organisateur}</p>
                <p><strong>Places restantes :</strong> {formation.placesRestantes ?? "Aucune info"}</p>
                <p><strong>Dates :</strong> {formation.dates.map(formatDate).join(", ")}</p>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Footer */}
      {/* <footer className="bg-gray-800 p-4 text-white mt-8">
        <div className="container mx-auto text-center">
        </div>
      </footer> */}
    </div>
  );
}
