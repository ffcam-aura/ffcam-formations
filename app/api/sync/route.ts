export const maxDuration = 60;
import { SyncService } from '@/services/formation/sync.service';
import { logger } from '@/lib/logger';
import { validateCronSecret, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!validateCronSecret(authHeader)) {
    return unauthorizedResponse();
  }

  try {
    const syncResult = await SyncService.synchronize();

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