export type Region = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";

export const REGION_ABBREVIATIONS: Record<Region, string> = {
  Norte: "N",
  Nordeste: "NE",
  "Centro-Oeste": "CO",
  Sudeste: "SE",
  Sul: "S",
};

export const STATE_TO_REGION: Record<string, string> = {
  AC: "N",
  AM: "N",
  AP: "N",
  PA: "N",
  RO: "N",
  RR: "N",
  TO: "N",
  AL: "NE",
  BA: "NE",
  CE: "NE",
  MA: "NE",
  PB: "NE",
  PE: "NE",
  PI: "NE",
  RN: "NE",
  SE: "NE",
  DF: "CO",
  GO: "CO",
  MT: "CO",
  MS: "CO",
  ES: "SE",
  MG: "SE",
  RJ: "SE",
  SP: "SE",
  PR: "S",
  RS: "S",
  SC: "S",
};

export const REGION_TO_STATES: Record<Region, string[]> = {
  Norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
};

export type LayerType =
  | "branches"
  | "marketPotential"
  | "competition"
  | "expansion"
  | "demand";

export interface State {
  name: string;
  uf: string;
  region: Region;
  population: number;
  gdpPerCapita: number;
  averageIncome: number;
  potentialScore: number;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  uf: string;
  lat: number;
  lng: number;
  openedAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  city: string;
  uf: string;
  lat: number;
  lng: number;
}

// ─── Filter Types ───

export type Sector =
  | "Varejo"
  | "Tecnologia"
  | "Saúde"
  | "Indústria"
  | "Serviços"
  | "Educação";

export type Porte = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export type RevenueRange = "0-100k" | "100k-1M" | "1M-10M" | "10M-50M" | "50M+";

export interface FilterState {
  sectors: Sector[];
  portes: Porte[];
  revenueRanges: RevenueRange[];
  regions: Region[];
}

export interface Company {
  id: string;
  name: string;
  sector: Sector;
  porte: Porte;
  revenue: RevenueRange;
  uf: string;
  city: string;
  lat: number;
  lng: number;
}

export interface CounterData {
  total: number;
  filtered: number;
}

export interface ExpansionScore {
  uf: string;
  similarity: number;
}
