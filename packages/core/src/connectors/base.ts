import type { Connector, ConnectorResult, RawSignal } from "../types";

export abstract class BaseConnector implements Connector {
  abstract provider: string;
  abstract fetch(params?: Record<string, unknown>): Promise<unknown[]>;
  abstract normalize(raw: unknown): RawSignal | null;

  async run(params?: Record<string, unknown>): Promise<ConnectorResult> {
    const rawItems = await this.fetch(params);
    const items: RawSignal[] = [];
    for (const raw of rawItems) {
      const normalized = this.normalize(raw);
      if (normalized) {
        items.push(normalized);
      }
    }
    return { items };
  }
}
