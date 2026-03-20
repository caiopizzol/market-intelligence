import type { LayerType } from "@driva/shared";

interface MapLegendProps {
  activeLayers: Set<LayerType>;
}

export function MapLegend({ activeLayers }: MapLegendProps) {
  const showExpansion = activeLayers.has("expansion");
  const showHeatmap = activeLayers.has("marketPotential");

  if (!showExpansion && !showHeatmap) return null;

  return (
    <div className="bottom-legend">
      {showExpansion ? (
        <>
          <span>Baixa similaridade</span>
          <div className="grad-expansion" />
          <span>Alta</span>
        </>
      ) : (
        <>
          <span>Baixo</span>
          <div className="grad" />
          <span>Alto</span>
        </>
      )}
    </div>
  );
}
