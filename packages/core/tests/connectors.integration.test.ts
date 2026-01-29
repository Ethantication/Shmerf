import { describe, expect, it, vi } from "vitest";
import { ReliefWebConnector } from "../src/connectors/reliefweb";

const mockResponse = {
  data: [
    {
      id: "rw1",
      fields: {
        title: "Flood update",
        url: "https://reliefweb.int",
        body: "Update",
        date: { created: "2024-04-01T00:00:00Z" },
        primary_country: { iso3: "USA", name: "United States" },
        disaster_type: [{ name: "Flood" }],
      },
    },
  ],
};

describe("ReliefWeb connector", () => {
  it("fetches and normalizes records", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    vi.stubGlobal("fetch", fetchMock);
    const connector = new ReliefWebConnector();
    const items = await connector.run();

    expect(items.items.length).toBeGreaterThan(0);
    expect(items.items[0].provider).toBe("reliefweb");
    vi.unstubAllGlobals();
  });
});
