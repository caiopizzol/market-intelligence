import type { Company, Porte, RevenueRange, Sector } from "@driva/shared";

const sectors: Sector[] = [
  "Varejo",
  "Tecnologia",
  "Saúde",
  "Indústria",
  "Serviços",
  "Educação",
];
const sectorWeights = [30, 20, 10, 15, 20, 5];

const portes: Porte[] = ["1-10", "11-50", "51-200", "201-500", "500+"];
const porteWeights = [25, 30, 25, 15, 5];

const revenueByPorte: Record<Porte, RevenueRange[]> = {
  "1-10": ["0-100k", "100k-1M"],
  "11-50": ["100k-1M", "1M-10M"],
  "51-200": ["1M-10M", "10M-50M"],
  "201-500": ["10M-50M", "50M+"],
  "500+": ["50M+"],
};

// State capitals with coords and population weight for distribution
const stateData: {
  uf: string;
  city: string;
  lat: number;
  lng: number;
  weight: number;
}[] = [
  { uf: "SP", city: "São Paulo", lat: -23.55, lng: -46.63, weight: 180 },
  { uf: "MG", city: "Belo Horizonte", lat: -19.92, lng: -43.94, weight: 80 },
  { uf: "RJ", city: "Rio de Janeiro", lat: -22.91, lng: -43.17, weight: 70 },
  { uf: "BA", city: "Salvador", lat: -12.97, lng: -38.51, weight: 50 },
  { uf: "PR", city: "Curitiba", lat: -25.43, lng: -49.27, weight: 45 },
  { uf: "RS", city: "Porto Alegre", lat: -30.03, lng: -51.23, weight: 42 },
  { uf: "PE", city: "Recife", lat: -8.05, lng: -34.87, weight: 35 },
  { uf: "CE", city: "Fortaleza", lat: -3.72, lng: -38.53, weight: 33 },
  { uf: "PA", city: "Belém", lat: -1.46, lng: -48.5, weight: 28 },
  { uf: "SC", city: "Florianópolis", lat: -27.59, lng: -48.55, weight: 27 },
  { uf: "MA", city: "São Luís", lat: -2.53, lng: -44.28, weight: 22 },
  { uf: "GO", city: "Goiânia", lat: -16.69, lng: -49.25, weight: 25 },
  { uf: "AM", city: "Manaus", lat: -3.12, lng: -60.02, weight: 15 },
  { uf: "ES", city: "Vitória", lat: -20.32, lng: -40.34, weight: 16 },
  { uf: "PB", city: "João Pessoa", lat: -7.12, lng: -34.86, weight: 14 },
  { uf: "RN", city: "Natal", lat: -5.79, lng: -35.21, weight: 13 },
  { uf: "MT", city: "Cuiabá", lat: -15.6, lng: -56.1, weight: 13 },
  { uf: "MS", city: "Campo Grande", lat: -20.44, lng: -54.65, weight: 11 },
  { uf: "AL", city: "Maceió", lat: -9.67, lng: -35.74, weight: 11 },
  { uf: "PI", city: "Teresina", lat: -5.09, lng: -42.8, weight: 10 },
  { uf: "DF", city: "Brasília", lat: -15.79, lng: -47.88, weight: 15 },
  { uf: "SE", city: "Aracaju", lat: -10.91, lng: -37.07, weight: 8 },
  { uf: "RO", city: "Porto Velho", lat: -8.76, lng: -63.9, weight: 7 },
  { uf: "TO", city: "Palmas", lat: -10.18, lng: -48.33, weight: 6 },
  { uf: "AC", city: "Rio Branco", lat: -9.97, lng: -67.81, weight: 4 },
  { uf: "AP", city: "Macapá", lat: 0.03, lng: -51.05, weight: 3 },
  { uf: "RR", city: "Boa Vista", lat: 2.82, lng: -60.67, weight: 3 },
];

// Seeded random for reproducible data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function weightedPick<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function generateCompanies(): Company[] {
  const rand = seededRandom(42);
  const result: Company[] = [];
  let id = 1;

  const totalWeight = stateData.reduce((a, s) => a + s.weight, 0);

  for (const state of stateData) {
    const count = Math.max(3, Math.round((state.weight / totalWeight) * 850));

    for (let i = 0; i < count; i++) {
      const sector = weightedPick(sectors, sectorWeights, rand);
      const porte = weightedPick(portes, porteWeights, rand);
      const revenueOptions = revenueByPorte[porte];
      const revenue =
        revenueOptions[Math.floor(rand() * revenueOptions.length)];

      const cid = id++;
      result.push({
        id: `c${cid}`,
        name: `${sector} ${state.city} ${cid}`,
        sector,
        porte,
        revenue,
        uf: state.uf,
        city: state.city,
        lat: state.lat + (rand() - 0.5) * 2,
        lng: state.lng + (rand() - 0.5) * 2,
      });
    }
  }

  return result;
}

export const companies = generateCompanies();
