import { useEffect, useRef, useState } from "react";

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
  const ref = useRef<HTMLFieldSetElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    ref.current?.focus();

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      toggle(options[activeIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <fieldset
      className="filter-dropdown"
      ref={ref}
      tabIndex={-1}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      {options.map((opt, i) => (
        <label
          key={opt}
          className={`filter-option ${i === activeIndex ? "active" : ""}`}
        >
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
