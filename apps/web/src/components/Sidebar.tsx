import type {
  CounterData,
  FilterState,
  Porte,
  Region,
  RevenueRange,
  Sector,
} from "@driva/shared";
import { useRef, useState } from "react";
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

const periods = ["Ultimo mes", "12 meses", "Historico"];

function TimePeriod() {
  const [active, setActive] = useState("12 meses");
  return (
    <div className="time-period">
      {periods.map((p) => (
        <button
          type="button"
          key={p}
          className={`time-btn ${active === p ? "on" : ""}`}
          onClick={() => setActive(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

interface StateOption {
  uf: string;
  name: string;
}

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  counter: CounterData;
  states: StateOption[];
  onSelectState: (uf: string) => void;
}

function formatFilterValue(items: string[]): string | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  return `${items[0]} +${items.length - 1}`;
}

export function Sidebar({
  filters,
  onFilterChange,
  counter,
  states,
  onSelectState,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults =
    search.length >= 2
      ? states.filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  function handleSelect(uf: string) {
    onSelectState(uf);
    setSearch("");
    setActiveIndex(-1);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setSearch("");
      setActiveIndex(-1);
      (e.target as HTMLElement).blur();
      return;
    }

    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(searchResults[activeIndex].uf);
    }
  }
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
        <div className="search-wrapper" ref={searchRef}>
          <input
            className="search"
            placeholder="Buscar estado..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleSearchKeyDown}
          />
          {!search && <span className="search-hint">/</span>}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((s, i) => (
                <button
                  type="button"
                  key={s.uf}
                  className={`search-result ${i === activeIndex ? "active" : ""}`}
                  onClick={() => handleSelect(s.uf)}
                >
                  {s.name}
                  <span className="search-uf">{s.uf}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CounterBar counter={counter} />

      <TimePeriod />

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
