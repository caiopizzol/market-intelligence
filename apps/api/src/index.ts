import { Hono } from "hono";
import { cors } from "hono/cors";
import { branchesRouter } from "./routes/branches";
import { companiesRouter } from "./routes/companies";
import { competitorsRouter } from "./routes/competitors";
import { states } from "./routes/states";

const app = new Hono();

app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/states", states);
app.route("/branches", branchesRouter);
app.route("/companies", companiesRouter);
app.route("/competitors", competitorsRouter);

// Local dev (Bun)
if (typeof Bun !== "undefined") {
  Bun.serve({
    port: 4000,
    fetch: app.fetch,
  });
}

// Cloudflare Workers
export default app;
