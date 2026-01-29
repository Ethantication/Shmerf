import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface EonetEvent {
  id: string;
  title: string;
  categories: { title: string }[];
  geometry: { date: string; coordinates: [number, number] }[];
  sources: { url: string }[];
}

interface EonetResponse {
  events: EonetEvent[];
}

export class EonetConnector extends BaseConnector {
  provider = "eonet";

  async fetch(): Promise<EonetEvent[]> {
    const url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open";
    const data = await fetchJson<EonetResponse>(url);
    return data.events ?? [];
  }

  normalize(raw: EonetEvent): RawSignal | null {
    const geometry = raw.geometry?.[raw.geometry.length - 1];
    if (!raw.id || !geometry) {
      return null;
    }
    const lat = geometry.coordinates[1];
    const lon = geometry.coordinates[0];
    const categories = raw.categories?.map((item) => item.title.toLowerCase()) ?? [];

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: raw.id,
      type: "disaster",
      timestamp: geometry.date,
      lat,
      lon,
      regionId: null,
      countryCode: null,
      severity: clamp(categories.length / 4 + 0.2),
      confidence: 0.75,
      tags: ["eonet", ...categories],
      title: raw.title,
      summary: `NASA EONET event in ${categories.join(", ")}`,
      sourceUrl: raw.sources?.[0]?.url ?? null,
      raw,
      ingestedAt: new Date().toISOString(),
    };
  }
}
