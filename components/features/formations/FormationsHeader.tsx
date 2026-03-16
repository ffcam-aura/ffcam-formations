import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";
import { SignUpButton, SignedOut } from "@clerk/nextjs";

type FormationsHeaderProps = {
  showIntro: boolean;
  setShowIntro: (show: boolean) => void;
  lastSyncDate: string | null;
};

export function FormationsHeader({ lastSyncDate }: FormationsHeaderProps) {
  return (
    <>
      <h1 className="sr-only">Formations FFCAM</h1>
      <p className="text-xs text-muted-foreground text-right mb-4">
        Dernière synchronisation : {lastSyncDate ? format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm") : "Non disponible"}
      </p>

      <SignedOut>
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <AlertDescription className="text-sm text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-1">
            <span>
              Recevez des alertes email lors de nouvelles formations.
              Créez un compte gratuit pour commencer.
            </span>
            <SignUpButton mode="modal">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors">
                S&apos;inscrire
              </button>
            </SignUpButton>
          </AlertDescription>
        </Alert>
      </SignedOut>
    </>
  );
}
