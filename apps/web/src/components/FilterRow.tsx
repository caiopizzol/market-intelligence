import { useState } from "react";
import { FilterDropdown } from "./FilterDropdown";

interface FilterRowProps {
  icon: string;
  label: string;
  value: string | null;
  options?: string[];
  selected?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

export function FilterRow({
  icon,
  label,
  value,
  options,
  selected,
  onSelectionChange,
}: FilterRowProps) {
  const [open, setOpen] = useState(false);
  const hasDropdown = options && selected && onSelectionChange;

  return (
    <div className="filter-row-wrapper">
      <button
        type="button"
        className="filter-row"
        onClick={() => hasDropdown && setOpen(!open)}
      >
        <div className="filter-icon">{icon}</div>
        <span className="filter-label">{label}</span>
        {value ? (
          <span className="filter-value">{value}</span>
        ) : (
          <span className="filter-empty">Todos</span>
        )}
        <span className="filter-chevron">&rsaquo;</span>
      </button>
      {open && hasDropdown && (
        <FilterDropdown
          options={options}
          selected={selected}
          onChange={onSelectionChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
