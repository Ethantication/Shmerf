import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface UsgsFeature {
  id: string;
  properties: {
    time: number;
    mag: number;
    place: string;
    url: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

interface UsgsResponse {
  features: UsgsFeature[];
}

export class UsgsConnector extends BaseConnector {
  provider = "usgs";

  async fetch(): Promise<UsgsFeature[]> {
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
    const data = await fetchJson<UsgsResponse>(url);
    return data.features ?? [];
  }

  normalize(raw: UsgsFeature): RawSignal | null {
    if (!raw.id || !raw.properties?.time) {
      return null;
    }
    const [lon, lat, depth] = raw.geometry.coordinates;
    const magnitude = raw.properties.mag ?? 0;
    const severity = clamp(magnitude / 8);
    const confidence = clamp(0.8 - depth / 700);

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: raw.id,
      type: "quake",
      timestamp: new Date(raw.properties.time).toISOString(),
      lat,
      lon,
      regionId: null,
      countryCode: null,
      severity,
      confidence,
      tags: ["usgs", "earthquake"],
      title: raw.properties.place,
      summary: `Magnitude ${magnitude.toFixed(1)} earthquake` ,
      sourceUrl: raw.properties.url,
      raw,
      ingestedAt: new Date().toISOString(),
    };
  }
}
