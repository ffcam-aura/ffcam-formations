import { useState, useEffect } from "react";
import { Formation } from "@/app/types/formation";

export function useFormations() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [lastSyncDate, setLastSyncDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/formations");
        const data = await response.json();
        setFormations(data);

        // Récupérer la dernière synchronisation
        const responseLastSync = await fetch("/api/sync");
        const lastSync = await responseLastSync.json();
        if (lastSync) {
          setLastSyncDate(lastSync.toString());
        }
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  return { formations, lastSyncDate, loading, error };
}
