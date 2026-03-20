import type { Porte, Region, RevenueRange, Sector } from "@driva/shared";
import { Hono } from "hono";
import { branches } from "../data/branches";
import geojson from "../data/brazil-states.json";
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

  return filtered;
}

const expansionRouter = new Hono();

expansionRouter.get("/", (c) => {
  const params = new URL(c.req.url).searchParams;
  const filtered = applyFilters(params);

  // Count branches per state
  const branchCountByState: Record<string, number> = {};
  for (const b of branches) {
    branchCountByState[b.uf] = (branchCountByState[b.uf] ?? 0) + 1;
  }

  // Count filtered companies per state
  const companyCountByState: Record<string, number> = {};
  for (const co of filtered) {
    companyCountByState[co.uf] = (companyCountByState[co.uf] ?? 0) + 1;
  }

  // Get state demographics from GeoJSON
  const stateProps = (
    geojson as { features: { properties: Record<string, unknown> }[] }
  ).features.map((f) => f.properties);

  // States WITH branches = the "success profile"
  const statesWithBranches = stateProps.filter(
    (s) => (branchCountByState[s.uf as string] ?? 0) > 0,
  );

  if (statesWithBranches.length === 0) {
    return c.json([]);
  }

  // Calculate average profile of states with branches
  const avgCompanyDensity =
    statesWithBranches.reduce((sum, s) => {
      const count = companyCountByState[s.uf as string] ?? 0;
      const pop = s.population as number;
      return sum + count / pop;
    }, 0) / statesWithBranches.length;

  const avgGdp =
    statesWithBranches.reduce((sum, s) => sum + (s.gdpPerCapita as number), 0) /
    statesWithBranches.length;

  const avgPop =
    statesWithBranches.reduce((sum, s) => sum + (s.population as number), 0) /
    statesWithBranches.length;

  // For states WITHOUT branches, compute similarity to the average profile
  const results = stateProps
    .filter((s) => (branchCountByState[s.uf as string] ?? 0) === 0)
    .map((s) => {
      const uf = s.uf as string;
      const companyCount = companyCountByState[uf] ?? 0;
      const pop = s.population as number;
      const gdp = s.gdpPerCapita as number;

      const companyDensity = pop > 0 ? companyCount / pop : 0;

      // Similarity: compare each dimension to the average, normalize to 0-1
      const densitySim =
        avgCompanyDensity > 0
          ? 1 -
            Math.min(
              Math.abs(companyDensity - avgCompanyDensity) / avgCompanyDensity,
              1,
            )
          : 0;
      const gdpSim =
        avgGdp > 0 ? 1 - Math.min(Math.abs(gdp - avgGdp) / avgGdp, 1) : 0;
      const popSim =
        avgPop > 0 ? 1 - Math.min(Math.abs(pop - avgPop) / avgPop, 1) : 0;

      // Weighted average: company density matters most
      const similarity = Math.round(
        (densitySim * 0.5 + gdpSim * 0.3 + popSim * 0.2) * 100,
      );

      return { uf, similarity };
    })
    .filter((s) => s.similarity > 30)
    .sort((a, b) => b.similarity - a.similarity);

  return c.json(results);
});

export { expansionRouter };
