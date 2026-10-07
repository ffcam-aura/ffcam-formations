import { getCachedLastSync } from "@/lib/cachedFormations";
import { NextResponse } from "next/server";

export async function GET() {
  const lastSyncDate = await getCachedLastSync();
  return NextResponse.json(lastSyncDate);
}
export const dynamic = 'force-dynamic'
