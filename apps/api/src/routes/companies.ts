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

  const ufs = params.get("uf")?.split(",");
  if (ufs?.length) {
    filtered = filtered.filter((c) => ufs.includes(c.uf));
  }

  return filtered;
}

const companiesRouter = new Hono();

// Count: total + filtered
companiesRouter.get("/count", (c) => {
  const filtered = applyFilters(new URL(c.req.url).searchParams);
  return c.json({ total: companies.length, filtered: filtered.length });
});

// Count per state (for heatmap)
companiesRouter.get("/by-state", (c) => {
  const filtered = applyFilters(new URL(c.req.url).searchParams);
  const counts: Record<string, number> = {};
  for (const company of filtered) {
    counts[company.uf] = (counts[company.uf] ?? 0) + 1;
  }
  return c.json(counts);
});

// Full list (paginated in future, small dataset for now)
companiesRouter.get("/", (c) => {
  const filtered = applyFilters(new URL(c.req.url).searchParams);
  return c.json(filtered);
});

export { companiesRouter };
