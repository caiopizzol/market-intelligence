import type {
  CounterData,
  FilterState,
  Porte,
  Region,
  RevenueRange,
  Sector,
} from "@driva/shared";
import { CounterBar } from "./CounterBar";
import { FilterRow } from "./FilterRow";

const sectorOptions: Sector[] = [
  "Varejo",
  "Tecnologia",
  "Saúde",
  "Indústria",
  "Serviços",
  "Educação",
];

const porteOptions: Porte[] = ["1-10", "11-50", "51-200", "201-500", "500+"];

const revenueOptions: RevenueRange[] = [
  "0-100k",
  "100k-1M",
  "1M-10M",
  "10M-50M",
  "50M+",
];

const regionOptions: Region[] = [
  "Norte",
  "Nordeste",
  "Centro-Oeste",
  "Sudeste",
  "Sul",
];

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  counter: CounterData;
}

function formatFilterValue(items: string[]): string | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  return `${items[0]} +${items.length - 1}`;
}

export function Sidebar({ filters, onFilterChange, counter }: SidebarProps) {
  function updateFilter<K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) {
    onFilterChange({ ...filters, [key]: value });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo-row">
          <div className="logo">Market Intelligence</div>
        </div>
      </div>

      <CounterBar counter={counter} />

      <div className="filter-scroll">
        <FilterRow
          icon="&#8862;"
          label="Setor"
          value={formatFilterValue(filters.sectors)}
          options={sectorOptions}
          selected={filters.sectors}
          onSelectionChange={(v) => updateFilter("sectors", v as Sector[])}
        />
        <FilterRow
          icon="&#8865;"
          label="Porte"
          value={formatFilterValue(filters.portes)}
          options={porteOptions}
          selected={filters.portes}
          onSelectionChange={(v) => updateFilter("portes", v as Porte[])}
        />
        <FilterRow
          icon="$"
          label="Faturamento"
          value={formatFilterValue(filters.revenueRanges)}
          options={revenueOptions}
          selected={filters.revenueRanges}
          onSelectionChange={(v) =>
            updateFilter("revenueRanges", v as RevenueRange[])
          }
        />

        <div className="filter-divider" />

        <FilterRow
          icon="&#9678;"
          label="Região"
          value={formatFilterValue(filters.regions)}
          options={regionOptions}
          selected={filters.regions}
          onSelectionChange={(v) => updateFilter("regions", v as Region[])}
        />
      </div>
    </aside>
  );
}
