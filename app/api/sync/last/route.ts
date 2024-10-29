import { SyncService } from "@/services/formation/sync.service";
import { NextResponse } from "next/server";

export async function GET() {
  const lastSyncDate = await SyncService.getLastSyncDate();
  return NextResponse.json(lastSyncDate);
}
export const dynamic = 'force-dynamic'