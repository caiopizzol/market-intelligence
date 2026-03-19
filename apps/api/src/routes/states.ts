import { Hono } from "hono";
import geojson from "../data/brazil-states.json";

const states = new Hono();

states.get("/geojson", (c) => c.json(geojson));

states.get("/", (c) => {
  const features = (geojson as { features: { properties: unknown }[] })
    .features;
  const list = features.map((f) => f.properties);
  return c.json(list);
});

export { states };
