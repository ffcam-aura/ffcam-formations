import { useState, useEffect } from "react";
import { Formation } from "@/types/formation";
import { logger } from "@/lib/logger";

interface ErrorState {
  message: string;
  type: 'network' | 'server' | 'service_unavailable' | 'unknown';
  canRetry: boolean;
  statusCode?: number;
}

export function useFormations() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [lastSyncDate, setLastSyncDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchFormations = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/formations");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const errorState: ErrorState = {
          message: errorData.message || "Erreur lors du chargement des formations",
          type: response.status === 503 ? 'service_unavailable' : 'server',
          canRetry: response.status >= 500,
          statusCode: response.status
        };
        
        setError(errorState);
        return;
      }
      
      const data = await response.json();
      setFormations(Array.isArray(data) ? data : []);
      setRetryCount(0); // Reset retry count on success

      // Récupérer la dernière synchronisation
      try {
        const responseLastSync = await fetch("/api/sync/last");
        if (responseLastSync.ok) {
          const lastSync = await responseLastSync.json();
          if (lastSync) {
            setLastSyncDate(lastSync.toString());
          }
        }
      } catch (syncError) {
        logger.warn('Erreur lors de la récupération de la dernière sync', { error: syncError });
      }
      
    } catch (err) {
      logger.error('Erreur de réseau', err instanceof Error ? err : undefined, { rawError: err });
      const errorState: ErrorState = {
        message: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
        type: 'network',
        canRetry: true
      };
      setError(errorState);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchFormations(true);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  return { 
    formations, 
    lastSyncDate, 
    loading, 
    error, 
    retry: error?.canRetry ? retry : undefined,
    retryCount 
  };
}
