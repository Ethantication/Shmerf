import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface OpenSkyResponse {
  time: number;
  states: Array<[string, string, string, number, number, number, number, number, number, number]>;
}

export class OpenSkyConnector extends BaseConnector {
  provider = "opensky";

  async fetch(): Promise<OpenSkyResponse[]> {
    const username = process.env.OPEN_SKY_USERNAME;
    const password = process.env.OPEN_SKY_PASSWORD;
    const headers: Record<string, string> = {};
    if (username && password) {
      const encoded = Buffer.from(`${username}:${password}`).toString("base64");
      headers.Authorization = `Basic ${encoded}`;
    }
    const data = await fetchJson<OpenSkyResponse>("https://opensky-network.org/api/states/all", {
      headers,
    });
    return [data];
  }

  normalize(raw: OpenSkyResponse): RawSignal | null {
    if (!raw.states?.length) {
      return null;
    }
    const gridCounts = new Map<string, { count: number; lat: number; lon: number }>();
    for (const state of raw.states) {
      const lat = state[6];
      const lon = state[5];
      if (lat === null || lon === null || lat === undefined || lon === undefined) {
        continue;
      }
      const gridLat = Math.round(lat);
      const gridLon = Math.round(lon);
      const key = `${gridLat}:${gridLon}`;
      const entry = gridCounts.get(key) ?? { count: 0, lat: gridLat, lon: gridLon };
      entry.count += 1;
      gridCounts.set(key, entry);
    }

    const totalCount = raw.states.length;
    const dominant = Array.from(gridCounts.values()).sort((a, b) => b.count - a.count)[0];
    if (!dominant) {
      return null;
    }
    const severity = clamp(Math.min(1, dominant.count / 120));
    const confidence = clamp(0.55 + Math.min(0.3, totalCount / 2000));

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: `opensky-${raw.time}`,
      type: "aviation",
      timestamp: new Date(raw.time * 1000).toISOString(),
      lat: dominant.lat,
      lon: dominant.lon,
      regionId: null,
      countryCode: null,
      severity,
      confidence,
      tags: ["opensky", "air-traffic", `count:${totalCount}`],
      title: "Aviation density anomaly",
      summary: `Total airborne states: ${totalCount}, highest density cell count ${dominant.count}`,
      sourceUrl: "https://opensky-network.org",
      raw: { totalCount, grid: Array.from(gridCounts.values()).slice(0, 20) },
      ingestedAt: new Date().toISOString(),
    };
  }
}
