import type { Porte, Region, RevenueRange, Sector } from "@driva/shared";
import { REGION_TO_STATES } from "@driva/shared";
import { companies } from "../data/companies";

export function applyFilters(params: URLSearchParams) {
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
    const allowedUfs = regions.flatMap((r) => REGION_TO_STATES[r] ?? []);
    filtered = filtered.filter((c) => allowedUfs.includes(c.uf));
  }

  const ufs = params.get("uf")?.split(",");
  if (ufs?.length) {
    filtered = filtered.filter((c) => ufs.includes(c.uf));
  }

  return filtered;
}
