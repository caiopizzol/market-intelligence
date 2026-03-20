import type { CounterData, ExpansionScore, FilterState } from "@driva/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function fetchGeoJSON(): Promise<GeoJSON.FeatureCollection> {
  return fetchJSON(`${API_URL}/states/geojson`);
}

export function fetchBranches(): Promise<GeoJSON.FeatureCollection> {
  return fetchJSON(`${API_URL}/branches`);
}

export function fetchCompetitors(): Promise<GeoJSON.FeatureCollection> {
  return fetchJSON(`${API_URL}/competitors`);
}

function buildFilterParams(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.sectors.length) params.set("sector", filters.sectors.join(","));
  if (filters.portes.length) params.set("porte", filters.portes.join(","));
  if (filters.revenueRanges.length)
    params.set("revenue", filters.revenueRanges.join(","));
  if (filters.regions.length) params.set("region", filters.regions.join(","));
  return params.toString();
}

export function fetchCompanyCount(filters: FilterState): Promise<CounterData> {
  const qs = buildFilterParams(filters);
  return fetchJSON(`${API_URL}/companies/count?${qs}`);
}

export function fetchCompaniesByState(
  filters: FilterState,
): Promise<Record<string, number>> {
  const qs = buildFilterParams(filters);
  return fetchJSON(`${API_URL}/companies/by-state?${qs}`);
}

export function fetchExpansion(
  filters: FilterState,
): Promise<ExpansionScore[]> {
  const qs = buildFilterParams(filters);
  return fetchJSON(`${API_URL}/expansion?${qs}`);
}

export function fetchDemand(
  filters: FilterState,
): Promise<Record<string, number>> {
  const qs = buildFilterParams(filters);
  return fetchJSON(`${API_URL}/demand?${qs}`);
}
