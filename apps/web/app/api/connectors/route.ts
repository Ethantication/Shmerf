import { NextResponse } from "next/server";
import { db } from "@conflictpulse/core";

export async function GET() {
  const result = await db.query(
    `SELECT DISTINCT ON (provider)
      provider,
      status,
      last_success_at,
      finished_at,
      items_ingested,
      error_message
    FROM connector_runs
    ORDER BY provider, started_at DESC`
  );
  return NextResponse.json({ items: result.rows });
}
