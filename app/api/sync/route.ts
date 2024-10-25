import { NextResponse } from 'next/server';
import { SyncService } from '@/app/services/sync.service';

export async function GET() {
  const lastSyncDate = await SyncService.getLastSyncDate();
  return NextResponse.json(lastSyncDate);
}

export async function POST() {
  try {
    const syncResult = await SyncService.synchronize();
    await SyncService.sendSyncReport(syncResult);

    return NextResponse.json({
      success: true,
      stats: syncResult.stats
    });
  } catch (error) {
    console.error('Error in sync process:', error);
    await SyncService.sendErrorReport(error);

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync formations',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}