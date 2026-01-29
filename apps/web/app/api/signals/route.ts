import { NextResponse } from "next/server";
import { loadSignalsByRegion } from "@conflictpulse/core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionId = searchParams.get("regionId");
  if (!regionId) {
    return NextResponse.json({ items: [] });
  }
  const items = await loadSignalsByRegion(regionId);
  return NextResponse.json({ items });
}
