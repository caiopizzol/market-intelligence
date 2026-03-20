import { Hono } from "hono";
import { companies } from "../data/companies";
import { applyFilters } from "../lib/filters";

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
