"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";
import { SignUpButton, SignedOut } from "@clerk/nextjs";
import { X } from "lucide-react";

type FormationsHeaderProps = {
  lastSyncDate: string | null;
};

const BANNER_DISMISSED_KEY = "ffcam-banner-dismissed";

export function FormationsHeader({ lastSyncDate }: FormationsHeaderProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(BANNER_DISMISSED_KEY) === "true");
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  return (
    <>
      <h1 className="sr-only">Formations FFCAM</h1>
      <p className="text-xs text-muted-foreground text-right mb-4">
        Dernière synchronisation : {lastSyncDate ? format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm") : "Non disponible"}
      </p>

      {!dismissed && (
        <SignedOut>
          <Alert className="mb-6 border-primary/20 bg-primary/5 relative">
            <AlertDescription className="text-sm text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-1 pr-8">
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
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
              aria-label="Fermer la bannière"
            >
              <X size={16} />
            </button>
          </Alert>
        </SignedOut>
      )}
    </>
  );
}
