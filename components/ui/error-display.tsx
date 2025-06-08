import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorDisplayProps {
  error: {
    message: string;
    type: 'network' | 'server' | 'service_unavailable' | 'unknown';
    canRetry: boolean;
    statusCode?: number;
  };
  onRetry?: () => void;
  retryCount?: number;
  isRetrying?: boolean;
}

export function ErrorDisplay({ error, onRetry, retryCount = 0, isRetrying = false }: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <WifiOff className="h-5 w-5" />;
      case 'service_unavailable':
        return <Wifi className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return "Problème de connexion";
      case 'service_unavailable':
        return "Service temporairement indisponible";
      case 'server':
        return "Erreur du serveur";
      default:
        return "Une erreur s&apos;est produite";
    }
  };

  const getErrorDescription = () => {
    const baseMessage = error.message;
    
    if (error.type === 'service_unavailable') {
      return `${baseMessage} Le service sera bientôt de retour.`;
    }
    
    if (error.type === 'network') {
      return `${baseMessage} Vérifiez que vous êtes connecté à internet.`;
    }
    
    return baseMessage;
  };

  const canShowRetry = error.canRetry && onRetry && retryCount < 3;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <Alert className="max-w-md">
        <div className="flex items-center gap-2">
          {getErrorIcon()}
          <AlertTitle>{getErrorTitle()}</AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          {getErrorDescription()}
        </AlertDescription>
        
        {error.statusCode && (
          <div className="mt-2 text-xs text-muted-foreground">
            Code d&apos;erreur: {error.statusCode}
          </div>
        )}
      </Alert>

      {canShowRetry && (
        <div className="mt-6 text-center">
          <Button 
            onClick={onRetry} 
            disabled={isRetrying}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Rechargement...' : 'Réessayer'}
          </Button>
          
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Tentative {retryCount}/3
            </p>
          )}
        </div>
      )}

      {error.type === 'service_unavailable' && (
        <div className="mt-4 text-sm text-muted-foreground text-center max-w-md">
          <p>
            Les formations sont synchronisées depuis le site FFCAM. 
            Si le problème persiste, contactez l&apos;équipe technique.
          </p>
        </div>
      )}
    </div>
  );
}