import type { LayerType } from "@driva/shared";

type FillMode = "marketPotential" | "expansion" | "none";

const fillOptions: {
  id: FillMode;
  label: string;
  shortcut: string;
  gradient?: string;
}[] = [
  {
    id: "marketPotential",
    label: "Potencial de mercado",
    shortcut: "1",
    gradient: "linear-gradient(to right, #ef4444, #22c55e)",
  },
  {
    id: "expansion",
    label: "Oportunidades de expansão",
    shortcut: "2",
    gradient: "linear-gradient(to right, #fef3c7, #f59e0b)",
  },
  { id: "none", label: "Nenhum", shortcut: "3" },
];

const markerOptions: {
  id: LayerType;
  label: string;
  color: string;
  shortcut: string;
}[] = [
  { id: "branches", label: "Filiais", color: "#2563eb", shortcut: "Q" },
  { id: "competition", label: "Concorrência", color: "#dc2626", shortcut: "W" },
  { id: "demand", label: "Demanda estimada", color: "#7c3aed", shortcut: "E" },
];

interface LayerPanelProps {
  activeLayers: Set<LayerType>;
  onToggle: (layer: LayerType) => void;
}

function getFillMode(active: Set<LayerType>): FillMode {
  if (active.has("expansion")) return "expansion";
  if (active.has("marketPotential")) return "marketPotential";
  return "none";
}

export function LayerPanel({ activeLayers, onToggle }: LayerPanelProps) {
  const fillMode = getFillMode(activeLayers);

  function setFillMode(mode: FillMode) {
    const current = getFillMode(activeLayers);
    if (current === mode) return;

    // Turn off the current fill layer
    if (current === "marketPotential" || current === "expansion") {
      onToggle(current);
    }
    // Turn on the new fill layer
    if (mode === "marketPotential" || mode === "expansion") {
      onToggle(mode);
    }
  }

  return (
    <div className="layer-panel">
      <div className="lp-section">
        <div className="lp-title">Visualização</div>
        {fillOptions.map((opt) => (
          <button
            type="button"
            key={opt.id}
            className={`lp-radio ${fillMode === opt.id ? "on" : ""}`}
            onClick={() => setFillMode(opt.id)}
          >
            <div className="rd">
              <div className="rd-inner" />
            </div>
            <span className="lp-label">{opt.label}</span>
            <span className="lp-shortcut">{opt.shortcut}</span>
            {opt.gradient && (
              <div className="lp-swatch" style={{ background: opt.gradient }} />
            )}
          </button>
        ))}
      </div>

      <div className="lp-sep" />

      <div className="lp-section">
        <div className="lp-title">Marcadores</div>
        {markerOptions.map((opt) => (
          <button
            type="button"
            key={opt.id}
            className={`lp-check ${activeLayers.has(opt.id) ? "on" : ""}`}
            onClick={() => onToggle(opt.id)}
          >
            <div className="cb">
              {activeLayers.has(opt.id) && (
                <span className="cb-tick">&#10003;</span>
              )}
            </div>
            <div className="lp-dot" style={{ background: opt.color }} />
            <span>{opt.label}</span>
            <span className="lp-shortcut">{opt.shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
