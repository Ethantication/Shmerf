import { describe, expect, it } from "vitest";
import { GdeltConnector } from "../src/connectors/gdelt";
import { UsgsConnector } from "../src/connectors/usgs";

describe("connector normalizers", () => {
  it("normalizes GDELT events", () => {
    const connector = new GdeltConnector();
    const signal = connector.normalize({
      GLOBALEVENTID: "123",
      SQLDATE: "20240110",
      AvgTone: "-4",
      EventRootCode: "18",
      ActionGeo_Lat: "40.7",
      ActionGeo_Long: "-74.0",
      ActionGeo_Fullname: "New York, United States",
      SOURCEURL: "https://example.com",
    });

    expect(signal?.provider).toBe("gdelt");
    expect(signal?.severity).toBeGreaterThan(0);
    expect(signal?.type).toBe("news_event");
  });

  it("normalizes USGS features", () => {
    const connector = new UsgsConnector();
    const signal = connector.normalize({
      id: "ak123",
      properties: {
        time: Date.now(),
        mag: 4.9,
        place: "Test",
        url: "https://example.com",
      },
      geometry: {
        coordinates: [-150.0, 60.0, 10],
      },
    });

    expect(signal?.provider).toBe("usgs");
    expect(signal?.severity).toBeGreaterThan(0);
    expect(signal?.type).toBe("quake");
  });
});
