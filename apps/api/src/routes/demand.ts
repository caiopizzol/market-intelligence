import type { RevenueRange } from "@driva/shared";
import { Hono } from "hono";
import { applyFilters } from "../lib/filters";

const revenueMidpoints: Record<RevenueRange, number> = {
  "0-100k": 50_000,
  "100k-1M": 550_000,
  "1M-10M": 5_500_000,
  "10M-50M": 30_000_000,
  "50M+": 75_000_000,
};

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
