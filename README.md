# Market Intelligence Platform

A market intelligence tool for retail expansion planning. Filter companies by segment, visualize market potential geographically, identify expansion opportunities through lookalike analysis, and analyze competitive landscape — all on an interactive map of Brazil.

**Live demo**: https://driva-web.pages.dev

## Quick Start

```bash
git clone https://github.com/caiopizzol/market-intelligence.git
cd market-intelligence
docker compose up --build
open http://localhost:3000
```

## Architecture

Monorepo with three packages:

```
├── apps/web          React + Vite + Leaflet (Cloudflare Pages)
├── apps/api          Hono.js REST API (Cloudflare Workers)
├── packages/shared   TypeScript types shared across apps
├── docker-compose.yml
└── biome.json
```

**Frontend**: React 19, TypeScript, Leaflet with react-leaflet for the interactive map, react-leaflet-cluster for marker clustering. Deployed to Cloudflare Pages.

**Backend**: Hono.js framework running on Bun locally and Cloudflare Workers in production. Serves mock company data, branch locations, competitor locations, expansion scores, and demand estimates via REST endpoints.

**Shared**: TypeScript interfaces for State, Company, Branch, Competitor, FilterState, and other domain types consumed by both frontend and backend.

## Data Layers

The platform has two categories of map visualization:

### Fill modes (radio — one at a time)

| Layer | Description |
|---|---|
| **Potencial de mercado** | Heatmap coloring states by company density matching the active filters. Green = high concentration, red = low. Driven by the platform's company database. |
| **Oportunidades de expansão** | Lookalike analysis inspired by Cortex Geofusion's expansion methodology. Profiles the user's existing store locations (GDP, population, company density), then highlights states without stores that share a similar profile. Amber intensity = similarity score. |

### Marker overlays (checkboxes — stackable)

| Layer | Description |
|---|---|
| **Filiais** | Blue markers showing the company's own store locations. Imported from CRM in production, mocked as 24 locations for the demo. Click for store name, city, and opening date. |
| **Concorrência** | Red markers showing known competitor locations. 39 locations across major retail chains. Click for competitor name and city. |
| **Demanda estimada** | Proportional purple bubbles centered on each state. Size represents total estimated revenue opportunity (company count × revenue midpoint). Click for the R$ value. Reactive to filters. |

## Filters

Apollo-style filter panel that narrows the company universe in real-time:

- **Setor**: Varejo, Tecnologia, Saúde, Indústria, Serviços, Educação
- **Porte**: Employee ranges (1-10 through 500+)
- **Faturamento**: Revenue ranges (R$ 0-100k through R$ 50M+)
- **Região**: Norte, Nordeste, Centro-Oeste, Sudeste, Sul

The counter bar shows the TAM narrowing: `850 → 80 empresas`. The map, expansion scores, and demand bubbles all react to filter changes (debounced 200ms).

## State Detail Panel

Click any state on the map to see contextual metrics. The panel adapts based on active layers:

- Always: Population, GDP per capita, filtered company count
- With Filiais: branch count
- With Concorrência: competitor count
- With Expansão: similarity score + insight banner
- With Demanda: estimated demand value
- Mini bar chart comparing company distribution across 5 regions

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `1` | Potencial de mercado |
| `2` | Oportunidades de expansão |
| `3` | Nenhum (clear fill) |
| `Q` | Toggle Filiais |
| `W` | Toggle Concorrência |
| `E` | Toggle Demanda |
| `/` | Focus search |
| `Esc` | Close dropdown / clear search |

## Technical Decisions

**Hono over Express**: Hono runs on both Bun (local dev) and Cloudflare Workers (production) with zero code changes. Single entry point with a `typeof Bun` guard for the local server.

**Leaflet over MapLibre/Deck.gl**: Leaflet is the simplest choice for choropleth + markers. react-leaflet provides declarative React bindings. react-leaflet-cluster handles marker clustering when many points overlap.

**Filters on the API, not client-side**: Company filtering happens server-side via query parameters. This mirrors real-world behavior where the database handles filtering, and avoids sending the full dataset to the client on every filter change.

**Expansion as lookalike analysis**: Instead of a simple "states without stores" highlight, the expansion layer profiles existing store locations and computes similarity scores against states without presence. This approach is inspired by Cortex Geofusion's expansion methodology and provides data-driven recommendations rather than binary yes/no classifications.

**Contextual state panel**: The detail panel adapts its metrics based on which layers are active, showing only relevant information. This avoids overwhelming the user with numbers that don't apply to their current analysis mode.

**Mock data, realistic distribution**: 850 companies distributed across 27 states weighted by population. 24 branches concentrated in the Southeast/South corridor. 39 competitors from major retail chains. Revenue ranges correlated with company size.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Health check |
| `GET /states/geojson` | Brazil states GeoJSON with demographics |
| `GET /states` | State properties list |
| `GET /companies/count?sector=...&porte=...` | Total + filtered company count |
| `GET /companies/by-state?sector=...` | Company count per state (for heatmap) |
| `GET /branches` | Branch locations as GeoJSON points |
| `GET /competitors` | Competitor locations as GeoJSON points |
| `GET /expansion?sector=...` | Lookalike similarity scores per state |
| `GET /demand?sector=...` | Estimated revenue demand per state |

## Local Development

```bash
bun install
bun run dev          # starts both API (4000) and web (3000)
bun run lint         # biome check
bun run lint:fix     # biome check --fix
```

## Deploy

CI/CD via GitHub Actions. Push to `main` triggers parallel deploys:
- API → Cloudflare Workers (`wrangler deploy`)
- Web → Cloudflare Pages (`vite build` + `wrangler pages deploy`)
