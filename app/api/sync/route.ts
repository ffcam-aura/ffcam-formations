import { SyncService } from '@/services/formation/sync.service';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    const syncResult = await SyncService.synchronize();
    await SyncService.sendSyncReport(syncResult);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in sync process:', error);
    await SyncService.sendErrorReport(error);

    return Response.json({ success: false });
  }
}
export const dynamic = 'force-dynamic'