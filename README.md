# ConflictPulse

ConflictPulse is a research-focused early-warning dashboard that aggregates open-data signals (news, disasters, quakes, weather extremes, aviation anomalies, humanitarian alerts, macro indicators) into an explainable regional conflict risk index.

> **Disclaimer:** Indicative risk scoring, may be wrong, do not use for operational harm.

## Tech stack
- **Frontend:** Next.js App Router + TypeScript + Tailwind + MapLibre GL
- **Backend:** Next.js API routes + TypeScript
- **DB:** PostgreSQL + PostGIS
- **Worker:** Node + node-cron
- **Charts:** Recharts

## Local setup

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start Postgres + PostGIS

```bash
docker compose up -d
```

### 3) Run migrations

```bash
psql "$DATABASE_URL" -f db/migrations/001_init.sql
```

### 4) Seed region boundaries

```bash
pnpm --filter @conflictpulse/worker seed:regions
```

### 5) Start the worker (ingestion + scoring)

```bash
pnpm --filter @conflictpulse/worker start
```

### 6) Start the web app

```bash
pnpm --filter @conflictpulse/web dev
```

Open http://localhost:3000 to view the dashboard.

## Configuration

Copy `.env.example` to `.env` and update as needed. `OPEN_SKY_USERNAME` and `OPEN_SKY_PASSWORD` are optional but improve OpenSky rate limits.

`CONNECTORS` can be set to a comma-separated list (e.g. `gdelt,reliefweb`) to toggle providers, or `all` to run every connector.

## Data flow

1. **Connectors** fetch OSINT sources (GDELT, ReliefWeb, NASA EONET, USGS, Open-Meteo, NOAA/NWS, OpenSky, World Bank).
2. **Normalization** maps data into a shared signal schema.
3. **Storage** persists signals with PostGIS points + region assignment.
4. **Scoring** computes daily risk scores per region and captures explainable drivers.

## Ethics & scope

- Aggregated to regions or coarse grids.
- No tracking of individuals or tactical targeting.
- Intended for research and situational awareness only.
