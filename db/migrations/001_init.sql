CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
  centroid GEOMETRY(Point, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_event_id TEXT,
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  region_id TEXT REFERENCES regions(id),
  country_code TEXT,
  severity DOUBLE PRECISION NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT,
  raw JSONB NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  geom GEOMETRY(Point, 4326)
);

CREATE UNIQUE INDEX IF NOT EXISTS signals_provider_event_id_idx
  ON signals (provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS signals_geom_idx ON signals USING GIST (geom);
CREATE INDEX IF NOT EXISTS signals_region_idx ON signals (region_id);
CREATE INDEX IF NOT EXISTS signals_timestamp_idx ON signals (timestamp);

CREATE TABLE IF NOT EXISTS region_daily_scores (
  id UUID PRIMARY KEY,
  region_id TEXT REFERENCES regions(id),
  date DATE NOT NULL,
  risk_score DOUBLE PRECISION NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  drivers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(region_id, date)
);

CREATE TABLE IF NOT EXISTS connector_runs (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  error_message TEXT,
  items_ingested INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS connector_runs_provider_idx ON connector_runs (provider);
