import type { Porte, Region, RevenueRange, Sector } from "@driva/shared";
import { Hono } from "hono";
import { companies } from "../data/companies";

const regionToStates: Record<Region, string[]> = {
  Norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
};

const revenueMidpoints: Record<RevenueRange, number> = {
  "0-100k": 50_000,
  "100k-1M": 550_000,
  "1M-10M": 5_500_000,
  "10M-50M": 30_000_000,
  "50M+": 75_000_000,
};

function applyFilters(params: URLSearchParams) {
  let filtered = companies;

  const sectors = params.get("sector")?.split(",") as Sector[] | undefined;
  if (sectors?.length) {
    filtered = filtered.filter((c) => sectors.includes(c.sector));
  }

  const portes = params.get("porte")?.split(",") as Porte[] | undefined;
  if (portes?.length) {
    filtered = filtered.filter((c) => portes.includes(c.porte));
  }

  const revenues = params.get("revenue")?.split(",") as
    | RevenueRange[]
    | undefined;
  if (revenues?.length) {
    filtered = filtered.filter((c) => revenues.includes(c.revenue));
  }

  const regions = params.get("region")?.split(",") as Region[] | undefined;
  if (regions?.length) {
    const allowedUfs = regions.flatMap((r) => regionToStates[r] ?? []);
    filtered = filtered.filter((c) => allowedUfs.includes(c.uf));
  }

  return filtered;
}

const demandRouter = new Hono();

// Returns estimated demand (total revenue) per state
demandRouter.get("/", (c) => {
  const filtered = applyFilters(new URL(c.req.url).searchParams);

  const demandByState: Record<string, number> = {};
  for (const company of filtered) {
    const value = revenueMidpoints[company.revenue] ?? 0;
    demandByState[company.uf] = (demandByState[company.uf] ?? 0) + value;
  }

  return c.json(demandByState);
});

export { demandRouter };
