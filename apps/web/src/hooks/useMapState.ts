import type { FilterState, LayerType } from "@driva/shared";
import { useCallback, useState } from "react";

const defaultLayers = new Set<LayerType>(["branches", "marketPotential"]);

const defaultFilters: FilterState = {
  sectors: [],
  portes: [],
  revenueRanges: [],
  regions: [],
};

export function useMapState() {
  const [activeLayers, setActiveLayers] = useState(defaultLayers);
  const [selectedUf, setSelectedUf] = useState<string | null>(null);
  const [filters, setFilters] = useState(defaultFilters);

  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  return {
    activeLayers,
    toggleLayer,
    selectedUf,
    setSelectedUf,
    filters,
    setFilters,
  };
}
