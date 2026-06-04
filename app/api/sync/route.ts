export const maxDuration = 60;
import { revalidateTag } from 'next/cache';
import { SyncService } from '@/services/formation/sync.service';
import { FORMATIONS_CACHE_TAG } from '@/lib/cachedFormations';
import { logger } from '@/lib/logger';
import { validateCronSecret, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!validateCronSecret(authHeader)) {
    return unauthorizedResponse();
  }

  try {
    const syncResult = await SyncService.synchronize();

    // Les données viennent d'être mises à jour : on invalide le cache des
    // lectures publiques pour que le site reflète le sync en quelques minutes
    // (sinon le cache 24h pourrait servir des données périmées jusqu'au
    // prochain TTL). C'est ce qui permet de cacher agressivement sans dégrader
    // la fraîcheur.
    revalidateTag(FORMATIONS_CACHE_TAG);

    // Build report for healthcheck (visible in healthchecks.io dashboard)
    const status = syncResult.errors.length === 0 ? '✅' : '⚠️';
    const errorInfo = syncResult.errors.length > 0
      ? `\n⚠️ ${syncResult.errors.length} erreur(s): ${syncResult.errors.map(e => e.reference).join(', ')}`
      : '';
    const message = [
      `${status} Sync FFCAM - ${syncResult.succeeded}/${syncResult.formations.length} formations`,
      `⏱️ Durée: ${syncResult.duration.toFixed(1)}s`,
      errorInfo,
    ].filter(Boolean).join('\n');

    // Send partial error report if some formations failed
    if (syncResult.errors.length > 0) {
      await SyncService.sendPartialErrorReport(syncResult);
    }

    await SyncService.pingHealthcheck(true, message);

    return Response.json({ success: true, stats: syncResult.stats });
  } catch (error) {
    logger.error('Erreur API /api/sync', error);

    // Send error email AND ping healthcheck as failed
    await Promise.all([
      SyncService.sendErrorReport(error),
      SyncService.pingHealthcheck(false, error instanceof Error ? error.message : String(error)),
    ]);

    return Response.json({ success: false });
  }
}
export const dynamic = 'force-dynamic'