import { NextResponse } from "next/server";
import { db } from "@conflictpulse/core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionId = searchParams.get("regionId");
  if (!regionId) {
    return NextResponse.json({ items: [] });
  }
  const result = await db.query(
    `SELECT date, risk_score, confidence
    FROM region_daily_scores
    WHERE region_id = $1
    ORDER BY date DESC
    LIMIT 7`,
    [regionId]
  );
  const items = result.rows.map((row) => ({
    date: row.date,
    risk_score: Number(row.risk_score),
    confidence: Number(row.confidence),
  }));
  return NextResponse.json({ items });
}
