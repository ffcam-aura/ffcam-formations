import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";

type FormationsHeaderProps = {
  showIntro: boolean;
  setShowIntro: (show: boolean) => void;
  lastSyncDate: string | null;
};

export function FormationsHeader({ showIntro, setShowIntro, lastSyncDate }: FormationsHeaderProps) {
  return (
    <>
      {showIntro && (
        <Alert className="mb-6 pr-12 relative">
          <AlertDescription className="text-sm text-muted-foreground">
            Explorez facilement toutes les formations FFCAM en un seul endroit !
            Notre outil récupère les formations publiées sur le site de la FFCAM pour simplifier votre recherche. 
            Nous vous proposerons bientôt des alertes personnalisées selon vos disciplines préférées. 🏔️
          </AlertDescription>
          <button
            onClick={() => setShowIntro(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer le message"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <h2 className="text-3xl font-bold mb-4 text-center text-primary">
        Découvrez les formations de la FFCAM
      </h2>
      
      <p className="text-center text-sm text-neutral mb-8">
        Dernière synchronisation : {lastSyncDate ? format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm") : "Non disponible"}
      </p>
    </>
  );
}