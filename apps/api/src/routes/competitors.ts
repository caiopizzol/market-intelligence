import { Hono } from "hono";
import { competitors } from "../data/competitors";

const competitorsRouter = new Hono();

competitorsRouter.get("/", (c) => {
  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: competitors.map((comp) => ({
      type: "Feature" as const,
      properties: {
        id: comp.id,
        name: comp.name,
        city: comp.city,
        uf: comp.uf,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [comp.lng, comp.lat],
      },
    })),
  };
  return c.json(geojson);
});

export { competitorsRouter };
