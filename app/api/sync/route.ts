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
    await SyncService.sendSyncReport(syncResult);

    return Response.json({ success: true });
  } catch (error) {
    logger.error('Erreur API /api/sync', error);
    await SyncService.sendErrorReport(error);

    return Response.json({ success: false });
  }
}
export const dynamic = 'force-dynamic'