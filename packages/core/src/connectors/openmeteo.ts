import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max?: number[];
    precipitation_sum?: number[];
  };
}

interface OpenMeteoSample {
  point: { lat: number; lon: number };
  data: OpenMeteoResponse;
}

const SAMPLE_POINTS = [
  { lat: 40.7, lon: -74.0 },
  { lat: 19.4, lon: -99.1 },
  { lat: 49.3, lon: -123.1 },
];

export class OpenMeteoConnector extends BaseConnector {
  provider = "open-meteo";

  async fetch(): Promise<OpenMeteoSample[]> {
    const requests = SAMPLE_POINTS.map((point) =>
      fetchJson<OpenMeteoResponse>(
        `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}&daily=temperature_2m_max,precipitation_sum&forecast_days=3&timezone=UTC`
      ).then((data) => ({ point, data }))
    );
    return Promise.all(requests);
  }

  normalize(raw: OpenMeteoSample): RawSignal | null {
    if (!raw.data.daily?.time?.length) {
      return null;
    }
    const latestIndex = raw.data.daily.time.length - 1;
    const date = raw.data.daily.time[latestIndex];
    const maxTemp = raw.data.daily.temperature_2m_max?.[latestIndex] ?? 0;
    const precip = raw.data.daily.precipitation_sum?.[latestIndex] ?? 0;
    const severity = clamp((maxTemp > 35 ? 0.6 : 0) + (precip > 50 ? 0.5 : 0));
    const confidence = clamp(0.65 + (severity > 0 ? 0.2 : 0));

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: `${date}-${raw.point.lat}-${raw.point.lon}-${maxTemp}-${precip}`,
      type: "weather",
      timestamp: new Date(date).toISOString(),
      lat: raw.point.lat,
      lon: raw.point.lon,
      regionId: null,
      countryCode: null,
      severity,
      confidence,
      tags: ["open-meteo", maxTemp > 35 ? "heat" : "", precip > 50 ? "flood-risk" : ""].filter(
        Boolean
      ) as string[],
      title: "Weather extremes signal",
      summary: `Max temp ${maxTemp}°C, precipitation ${precip}mm`,
      sourceUrl: "https://open-meteo.com",
      raw: raw.data,
      ingestedAt: new Date().toISOString(),
    };
  }
}
