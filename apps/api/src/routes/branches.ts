import { Hono } from "hono";
import { branches } from "../data/branches";

const branchesRouter = new Hono();

branchesRouter.get("/", (c) => {
  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: branches.map((b) => ({
      type: "Feature" as const,
      properties: {
        id: b.id,
        name: b.name,
        city: b.city,
        uf: b.uf,
        openedAt: b.openedAt,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [b.lng, b.lat],
      },
    })),
  };
  return c.json(geojson);
});

export { branchesRouter };
