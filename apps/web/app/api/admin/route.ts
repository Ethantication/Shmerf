import { NextResponse } from "next/server";
import { db } from "@conflictpulse/core";

export async function GET() {
  const result = await db.query(
    `SELECT id, provider, status, started_at, finished_at, error_message, items_ingested
    FROM connector_runs
    ORDER BY started_at DESC
    LIMIT 20`
  );
  return NextResponse.json({ items: result.rows });
}
