export type SignalType =
  | "news_event"
  | "disaster"
  | "quake"
  | "weather"
  | "aviation"
  | "humanitarian"
  | "macro";

export interface RawSignal {
  id: string;
  provider: string;
  providerEventId?: string | null;
  type: SignalType;
  timestamp: string;
  lat?: number | null;
  lon?: number | null;
  regionId?: string | null;
  countryCode?: string | null;
  severity: number;
  confidence: number;
  tags: string[];
  title: string;
  summary?: string | null;
  sourceUrl?: string | null;
  raw: Record<string, unknown>;
  ingestedAt: string;
}

export interface ConnectorResult {
  items: RawSignal[];
}

export interface ConnectorContext {
  startedAt: Date;
  rateLimitDelayMs?: number;
}

export interface Connector {
  provider: string;
  fetch: (params?: Record<string, unknown>) => Promise<unknown[]>;
  normalize: (raw: unknown) => RawSignal | null;
  run: (params?: Record<string, unknown>) => Promise<ConnectorResult>;
}

export interface RegionScore {
  regionId: string;
  date: string;
  riskScore: number;
  confidence: number;
  drivers: Record<string, number>;
}
