import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";
import { SignUpButton, SignedOut } from "@clerk/nextjs";

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
            Notre outil récupère les formations publiées sur le site de la FFCAM pour simplifier votre recherche. 🏔️
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

      <SignedOut>
        <Alert className="mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 relative overflow-hidden">
          <div className="absolute -left-12 top-4 bg-primary text-primary-foreground px-12 py-1 -rotate-45 text-xs font-semibold shadow-md">
            Nouveau !
          </div>

          <AlertDescription className="text-sm text-muted-foreground flex items-center justify-between gap-8 py-2">
            <span className="pl-8">
              <span className="text-2xl mr-2">🔔</span>
              Vous pouvez désormais recevoir des alertes par mail lorsqu&apos;une nouvelle formation est publiée.
              Pour cela, il suffit de créer un compte gratuit.
            </span>
            <SignUpButton mode="modal">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md whitespace-nowrap transition-all hover:scale-105">
                S&apos;inscrire
              </button>
            </SignUpButton>
          </AlertDescription>
        </Alert>
      </SignedOut>

      <h1 className="text-3xl font-bold mb-4 text-center text-primary">
        Découvrez les formations de la FFCAM
      </h1>

      <p className="text-center text-sm text-neutral mb-8">
        Dernière synchronisation : {lastSyncDate ? format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm") : "Non disponible"}
      </p>
    </>
  );
}