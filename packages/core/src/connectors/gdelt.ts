import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface GdeltEvent {
  GLOBALEVENTID: string;
  SQLDATE: string;
  Actor1CountryCode?: string;
  Actor2CountryCode?: string;
  ActionGeo_Lat?: string;
  ActionGeo_Long?: string;
  AvgTone?: string;
  EventCode?: string;
  EventRootCode?: string;
  ActionGeo_Fullname?: string;
  SOURCEURL?: string;
}

interface GdeltResponse {
  events?: GdeltEvent[];
}

const NEGATIVE_CODES = new Set(["14", "18", "19", "20", "21", "22", "23", "24"]);

export class GdeltConnector extends BaseConnector {
  provider = "gdelt";

  async fetch(): Promise<GdeltEvent[]> {
    const url =
      "https://api.gdeltproject.org/api/v2/events/search?format=json&maxrecords=50&query=protest%20OR%20violence%20OR%20conflict";
    const data = await fetchJson<GdeltResponse>(url);
    return data.events ?? [];
  }

  normalize(raw: GdeltEvent): RawSignal | null {
    if (!raw.GLOBALEVENTID || !raw.SQLDATE) {
      return null;
    }
    const tone = Number(raw.AvgTone ?? "0");
    const isNegative = tone < 0 ? 1 : 0;
    const eventCode = raw.EventRootCode ?? raw.EventCode ?? "";
    const negativeCodeBoost = NEGATIVE_CODES.has(eventCode) ? 0.2 : 0;
    const severity = clamp(Math.abs(tone) / 10 + negativeCodeBoost);
    const confidence = clamp(0.6 + (tone < 0 ? 0.2 : 0));
    const lat = raw.ActionGeo_Lat ? Number(raw.ActionGeo_Lat) : null;
    const lon = raw.ActionGeo_Long ? Number(raw.ActionGeo_Long) : null;
    const countryCode = raw.Actor1CountryCode ?? raw.Actor2CountryCode ?? null;

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: raw.GLOBALEVENTID,
      type: "news_event",
      timestamp: `${raw.SQLDATE.slice(0, 4)}-${raw.SQLDATE.slice(4, 6)}-${raw.SQLDATE.slice(6, 8)}T00:00:00Z`,
      lat,
      lon,
      regionId: null,
      countryCode,
      severity,
      confidence: clamp(confidence - isNegative * 0.05),
      tags: ["gdelt", eventCode].filter(Boolean),
      title: raw.ActionGeo_Fullname ?? "GDELT event",
      summary: `GDELT event tone ${tone.toFixed(2)}`,
      sourceUrl: raw.SOURCEURL ?? null,
      raw,
      ingestedAt: new Date().toISOString(),
    };
  }
}
