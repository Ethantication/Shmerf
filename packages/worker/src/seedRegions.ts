import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "@conflictpulse/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const filePath = path.resolve(__dirname, "../../db/seed/boundaries.geojson");
  const raw = await readFile(filePath, "utf-8");
  const geojson = JSON.parse(raw) as {
    features: Array<{
      properties: { id: string; name: string; country_code: string };
      geometry: unknown;
    }>;
  };

  for (const feature of geojson.features) {
    await db.query(
      `INSERT INTO regions (id, name, country_code, geom, centroid)
      VALUES ($1, $2, $3,
        ST_SetSRID(ST_GeomFromGeoJSON($4), 4326),
        ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON($4), 4326))
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        country_code = EXCLUDED.country_code,
        geom = EXCLUDED.geom,
        centroid = EXCLUDED.centroid`,
      [
        feature.properties.id,
        feature.properties.name,
        feature.properties.country_code,
        JSON.stringify(feature.geometry),
      ]
    );
  }

  await db.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
