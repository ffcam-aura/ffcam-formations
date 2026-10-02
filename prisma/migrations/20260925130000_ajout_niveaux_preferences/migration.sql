-- Filtre optionnel des notifications par niveau de stage (#31) : initiale, certification, recyclage…
-- Valeurs de lib/niveaux.ts (ex. 'initiateur-1-certification') ; tableau vide = tous les niveaux.
-- Idempotent : peut être rejoué sans risque (prisma migrate deploy ou exécution manuelle).
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "niveaux" TEXT[] DEFAULT ARRAY[]::TEXT[];
