import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface ReliefWebItem {
  id: string;
  fields: {
    title: string;
    url: string;
    body?: string;
    date: { created: string };
    primary_country?: { iso3: string; name: string };
    disaster_type?: { name: string }[];
  };
}

interface ReliefWebResponse {
  data: ReliefWebItem[];
}

export class ReliefWebConnector extends BaseConnector {
  provider = "reliefweb";

  async fetch(): Promise<ReliefWebItem[]> {
    const url =
      "https://api.reliefweb.int/v1/reports?appname=conflictpulse&limit=30&profile=full";
    const data = await fetchJson<ReliefWebResponse>(url);
    return data.data ?? [];
  }

  normalize(raw: ReliefWebItem): RawSignal | null {
    if (!raw.id || !raw.fields?.title) {
      return null;
    }
    const tags = raw.fields.disaster_type?.map((item) => item.name.toLowerCase()) ?? [];
    const severity = clamp(tags.length / 5);
    const confidence = clamp(0.7 + (tags.length > 0 ? 0.1 : 0));

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: raw.id,
      type: "humanitarian",
      timestamp: raw.fields.date.created,
      lat: null,
      lon: null,
      regionId: null,
      countryCode: raw.fields.primary_country?.iso3 ?? null,
      severity,
      confidence,
      tags: ["reliefweb", ...tags],
      title: raw.fields.title,
      summary: raw.fields.body?.slice(0, 280) ?? null,
      sourceUrl: raw.fields.url,
      raw,
      ingestedAt: new Date().toISOString(),
    };
  }
}
