import type { LayerType } from "@driva/shared";

interface LayerConfig {
  id: LayerType;
  label: string;
  color: string;
}

const layers: LayerConfig[] = [
  { id: "branches", label: "Filiais", color: "#2563eb" },
  { id: "marketPotential", label: "Potencial", color: "#16a34a" },
  { id: "competition", label: "Concorrência", color: "#dc2626" },
];

interface LayerChipsProps {
  active: Set<LayerType>;
  onToggle: (layer: LayerType) => void;
}

export function LayerChips({ active, onToggle }: LayerChipsProps) {
  return (
    <div className="layer-bar">
      {layers.map((l) => (
        <button
          type="button"
          key={l.id}
          className={`lchip ${active.has(l.id) ? "on" : ""}`}
          onClick={() => onToggle(l.id)}
        >
          <div className="ldot" style={{ background: l.color }} />
          {l.label}
        </button>
      ))}
    </div>
  );
}
