import { BaseConnector } from "./base";
import { fetchJson, clamp } from "../utils/http";
import type { RawSignal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface WorldBankRecord {
  country: { id: string; value: string };
  date: string;
  value: number | null;
  indicator: { id: string; value: string };
}

type WorldBankResponse = [unknown, WorldBankRecord[]];

const INDICATORS = [
  { id: "NY.GDP.MKTP.KD.ZG", name: "GDP growth" },
  { id: "FP.CPI.TOTL.ZG", name: "Inflation" },
];

const COUNTRIES = ["USA", "CAN", "MEX"];

export class WorldBankConnector extends BaseConnector {
  provider = "worldbank";

  async fetch(): Promise<WorldBankRecord[]> {
    const records: WorldBankRecord[] = [];
    for (const indicator of INDICATORS) {
      const url = `https://api.worldbank.org/v2/country/${COUNTRIES.join(",")}/indicator/${indicator.id}?format=json&per_page=50`;
      const response = await fetchJson<WorldBankResponse>(url);
      records.push(...(response[1] ?? []));
    }
    return records;
  }

  normalize(raw: WorldBankRecord): RawSignal | null {
    if (!raw.country?.id || raw.value === null) {
      return null;
    }
    const indicatorId = raw.indicator?.id ?? "macro";
    const value = raw.value ?? 0;
    const severity = clamp(Math.abs(value) / 10);
    const confidence = 0.6;

    return {
      id: uuidv4(),
      provider: this.provider,
      providerEventId: `${indicatorId}-${raw.country.id}-${raw.date}`,
      type: "macro",
      timestamp: new Date(`${raw.date}-01-01`).toISOString(),
      lat: null,
      lon: null,
      regionId: null,
      countryCode: raw.country.id,
      severity,
      confidence,
      tags: ["worldbank", indicatorId],
      title: `${raw.country.value} ${raw.indicator.value}`,
      summary: `${raw.indicator.value} value ${value}`,
      sourceUrl: "https://api.worldbank.org",
      raw,
      ingestedAt: new Date().toISOString(),
    };
  }
}
