import { db, upsertRegionScores } from "../db";
import type { RegionScore, SignalType } from "../types";
import { clamp } from "../utils/http";

const WEIGHTS: Record<SignalType, number> = {
  news_event: 0.25,
  humanitarian: 0.2,
  disaster: 0.15,
  quake: 0.1,
  weather: 0.1,
  aviation: 0.05,
  macro: 0.15,
};

export async function computeDailyScores(date: string): Promise<RegionScore[]> {
  const result = await db.query(
    `SELECT region_id, type,
      AVG(severity * confidence) AS avg_signal,
      COUNT(*) AS count
    FROM signals
    WHERE timestamp::date >= $1::date - INTERVAL '7 days'
      AND timestamp::date <= $1::date
      AND region_id IS NOT NULL
    GROUP BY region_id, type`,
    [date]
  );

  const regionMap = new Map<string, Record<string, { avg: number; count: number }>>();
  for (const row of result.rows) {
    const entry = regionMap.get(row.region_id) ?? {};
    entry[row.type] = { avg: Number(row.avg_signal), count: Number(row.count) };
    regionMap.set(row.region_id, entry);
  }

  const scores: RegionScore[] = [];
  for (const [regionId, signals] of regionMap.entries()) {
    let risk = 0;
    let confidence = 0;
    const drivers: Record<string, number> = {};
    let totalWeight = 0;
    for (const [type, weight] of Object.entries(WEIGHTS)) {
      totalWeight += weight;
      const signal = signals[type];
      const contribution = signal ? signal.avg * weight : 0;
      risk += contribution;
      drivers[type] = contribution;
      confidence += signal ? clamp(Math.min(1, signal.count / 15)) * weight : 0;
    }
    const normalizedRisk = clamp(risk / totalWeight);
    const normalizedConfidence = clamp(confidence / totalWeight);
    scores.push({
      regionId,
      date,
      riskScore: normalizedRisk,
      confidence: normalizedConfidence,
      drivers,
    });
  }

  await upsertRegionScores(scores);
  return scores;
}
