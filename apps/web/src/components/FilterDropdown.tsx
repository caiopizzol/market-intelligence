import { useEffect, useRef } from "react";

interface FilterDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onClose: () => void;
}

export function FilterDropdown({
  options,
  selected,
  onChange,
  onClose,
}: FilterDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <fieldset
      className="filter-dropdown"
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {options.map((opt) => (
        <label key={opt} className="filter-option">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </fieldset>
  );
}
