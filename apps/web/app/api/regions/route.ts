import { NextResponse } from "next/server";
import { loadRegionScores } from "@conflictpulse/core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const items = await loadRegionScores(date);
  return NextResponse.json({ items });
}
