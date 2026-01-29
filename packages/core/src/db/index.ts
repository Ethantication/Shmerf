import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import type { RawSignal, RegionScore } from "../types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  end: () => pool.end(),
};

export async function upsertSignals(signals: RawSignal[]): Promise<number> {
  if (signals.length === 0) {
    return 0;
  }

  let inserted = 0;
  for (const signal of signals) {
    const id = signal.id ?? uuidv4();
    const lat = signal.lat ?? null;
    const lon = signal.lon ?? null;
    const geom = lat !== null && lon !== null ? `POINT(${lon} ${lat})` : null;

    const result = await db.query(
      `INSERT INTO signals (
        id, provider, provider_event_id, type, timestamp, lat, lon, region_id,
        country_code, severity, confidence, tags, title, summary, source_url,
        raw, ingested_at, geom
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        COALESCE(
          $8,
          (SELECT id FROM regions WHERE country_code = $10 LIMIT 1),
          (SELECT id FROM regions
            WHERE $9 IS NOT NULL
            AND ST_Contains(geom, ST_SetSRID(ST_Point($7, $6), 4326))
            LIMIT 1)
        ),
        $10, $11, $12, $13, $14, $15, $16, $17, $18,
        CASE WHEN $19 IS NOT NULL THEN ST_SetSRID(ST_GeomFromText($19), 4326) ELSE NULL END
      )
      ON CONFLICT (provider, provider_event_id)
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        severity = EXCLUDED.severity,
        confidence = EXCLUDED.confidence,
        tags = EXCLUDED.tags,
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        source_url = EXCLUDED.source_url,
        raw = EXCLUDED.raw,
        ingested_at = EXCLUDED.ingested_at
      RETURNING id`,
      [
        id,
        signal.provider,
        signal.providerEventId ?? null,
        signal.type,
        signal.timestamp,
        lat,
        lon,
        signal.regionId ?? null,
        lat !== null && lon !== null ? true : null,
        signal.countryCode ?? null,
        signal.severity,
        signal.confidence,
        signal.tags,
        signal.title,
        signal.summary ?? null,
        signal.sourceUrl ?? null,
        signal.raw,
        signal.ingestedAt,
        geom,
      ]
    );

    if (result.rowCount && result.rowCount > 0) {
      inserted += 1;
    }
  }

  return inserted;
}

export async function insertConnectorRun(
  provider: string,
  status: "running" | "success" | "error",
  startedAt: Date,
  finishedAt?: Date,
  lastSuccessAt?: Date,
  errorMessage?: string,
  itemsIngested = 0
): Promise<void> {
  await db.query(
    `INSERT INTO connector_runs (
      id, provider, status, started_at, finished_at, last_success_at, error_message, items_ingested
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      uuidv4(),
      provider,
      status,
      startedAt,
      finishedAt ?? null,
      lastSuccessAt ?? null,
      errorMessage ?? null,
      itemsIngested,
    ]
  );
}

export async function upsertRegionScores(scores: RegionScore[]): Promise<void> {
  for (const score of scores) {
    await db.query(
      `INSERT INTO region_daily_scores (id, region_id, date, risk_score, confidence, drivers)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (region_id, date)
      DO UPDATE SET
        risk_score = EXCLUDED.risk_score,
        confidence = EXCLUDED.confidence,
        drivers = EXCLUDED.drivers`,
      [uuidv4(), score.regionId, score.date, score.riskScore, score.confidence, score.drivers]
    );
  }
}

export async function loadRegions(): Promise<
  { id: string; name: string; country_code: string; centroid: { x: number; y: number } }[]
> {
  const result = await db.query(
    `SELECT id, name, country_code, ST_X(centroid) AS x, ST_Y(centroid) AS y FROM regions`
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    country_code: row.country_code,
    centroid: { x: Number(row.x), y: Number(row.y) },
  }));
}

export async function loadSignalsByRegion(regionId: string, limit = 25) {
  const result = await db.query(
    `SELECT id, provider, type, timestamp, severity, confidence, title, summary, source_url
    FROM signals
    WHERE region_id = $1
    ORDER BY timestamp DESC
    LIMIT $2`,
    [regionId, limit]
  );
  return result.rows;
}

export async function loadRegionScores(date: string) {
  const result = await db.query(
    `SELECT r.id as region_id, r.name, r.country_code, ST_X(r.centroid) AS lon, ST_Y(r.centroid) AS lat,
      s.risk_score, s.confidence, s.drivers, s.created_at
    FROM regions r
    JOIN region_daily_scores s ON s.region_id = r.id
    WHERE s.date = $1`,
    [date]
  );
  return result.rows;
}
