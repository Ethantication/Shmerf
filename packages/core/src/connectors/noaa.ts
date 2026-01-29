import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface NoaaFeature {
  id: string;
  properties: {
    severity: string;
    event: string;
    sent: string;
    description?: string;
    areaDesc?: string;
    instruction?: string;
  };
  geometry?: {
    coordinates: number[][][];
  };
}

interface NoaaResponse {
  features: NoaaFeature[];
}

const SEVERITY_SCALE: Record<string, number> = {
  Extreme: 1,
  Severe: 0.8,
  Moderate: 0.6,
  Minor: 0.4,
  Unknown: 0.3,
};

export class NoaaConnector extends BaseConnector {
  provider = "noaa";

  async fetch(): Promise<NoaaFeature[]> {
    const url = "https://api.weather.gov/alerts/active?status=actual&message_type=alert";
    const data = await fetchJson<NoaaResponse>(url, {
      headers: { "User-Agent": "conflictpulse" },
    });
    return data.features ?? [];
  }

  normalize(raw: NoaaFeature): RawSignal | null {
    if (!raw.id || !raw.properties?.sent) {
      return null;
    }
    const severity = clamp(SEVERITY_SCALE[raw.properties.severity] ?? 0.3);
    const confidence = clamp(0.7 + (severity > 0.7 ? 0.1 : 0));

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: raw.id,
      type: "weather",
      timestamp: raw.properties.sent,
      lat: null,
      lon: null,
      regionId: null,
      countryCode: "US",
      severity,
      confidence,
      tags: ["noaa", raw.properties.event.toLowerCase()],
      title: raw.properties.event,
      summary: raw.properties.description ?? raw.properties.instruction ?? null,
      sourceUrl: `https://api.weather.gov/alerts/${raw.id}`,
      raw,
      ingestedAt: new Date().toISOString(),
    };
  }
}
