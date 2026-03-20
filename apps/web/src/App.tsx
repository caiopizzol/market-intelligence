import { STATE_TO_REGION, type State } from "@driva/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { LayerPanel } from "./components/LayerPanel";
import { MapLegend } from "./components/MapLegend";
import { MapView } from "./components/MapView";
import { Sidebar } from "./components/Sidebar";
import { useFilteredData } from "./hooks/useFilteredData";
import { useMapState } from "./hooks/useMapState";
import { fetchBranches, fetchCompetitors, fetchGeoJSON } from "./lib/api";

export function App() {
  const {
    activeLayers,
    toggleLayer,
    selectedUf,
    setSelectedUf,
    filters,
    setFilters,
  } = useMapState();

  // Keyboard shortcuts for layers
  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "/") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>(".search")?.focus();
        return;
      }

      switch (e.key) {
        case "1":
          if (activeLayers.has("expansion")) toggleLayer("expansion");
          if (!activeLayers.has("marketPotential"))
            toggleLayer("marketPotential");
          break;
        case "2":
          if (activeLayers.has("marketPotential"))
            toggleLayer("marketPotential");
          if (!activeLayers.has("expansion")) toggleLayer("expansion");
          break;
        case "3":
          if (activeLayers.has("marketPotential"))
            toggleLayer("marketPotential");
          if (activeLayers.has("expansion")) toggleLayer("expansion");
          break;
        case "q":
          toggleLayer("branches");
          break;
        case "w":
          toggleLayer("competition");
          break;
        case "e":
          toggleLayer("demand");
          break;
      }
    },
    [activeLayers, toggleLayer],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(
    null,
  );
  const [branchData, setBranchData] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [competitorData, setCompetitorData] =
    useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetchGeoJSON()
      .then(setGeoData)
      .catch((e) => console.error("Failed to load geo data", e));
    fetchBranches()
      .then(setBranchData)
      .catch((e) => console.error("Failed to load branches", e));
    fetchCompetitors()
      .then(setCompetitorData)
      .catch((e) => console.error("Failed to load competitors", e));
  }, []);

  const { counter, stateCompanyCounts, expansionScores, demandByState } =
    useFilteredData(filters);

  const branchCountsByState = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of branchData?.features ?? []) {
      const uf = f.properties?.uf as string;
      if (uf) counts[uf] = (counts[uf] ?? 0) + 1;
    }
    return counts;
  }, [branchData]);

  const competitorCountsByState = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of competitorData?.features ?? []) {
      const uf = f.properties?.uf as string;
      if (uf) counts[uf] = (counts[uf] ?? 0) + 1;
    }
    return counts;
  }, [competitorData]);

  // Company counts aggregated by region abbreviation (for the mini chart)
  const regionCompanyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [uf, count] of Object.entries(stateCompanyCounts)) {
      const region = STATE_TO_REGION[uf] ?? "";
      if (region) counts[region] = (counts[region] ?? 0) + count;
    }
    return counts;
  }, [stateCompanyCounts]);

  const stateList = useMemo(() => {
    if (!geoData) return [];
    return geoData.features
      .filter((f) => f.properties != null)
      .map((f) => ({
        uf: f.properties.uf as string,
        name: f.properties.name as string,
      }));
  }, [geoData]);

  const selectedState: State | null = useMemo(() => {
    if (!geoData || !selectedUf) return null;
    const feature = geoData.features.find(
      (f) => f.properties?.uf === selectedUf,
    );
    if (!feature?.properties) return null;
    const p = feature.properties;
    return {
      name: p.name,
      uf: p.uf,
      region: p.region,
      population: p.population,
      gdpPerCapita: p.gdpPerCapita,
      averageIncome: p.averageIncome,
      potentialScore: p.potentialScore,
    };
  }, [geoData, selectedUf]);

  return (
    <>
      <Sidebar
        filters={filters}
        onFilterChange={setFilters}
        counter={counter}
        states={stateList}
        onSelectState={setSelectedUf}
      />
      <div className="main">
        <MapView
          activeLayers={activeLayers}
          geoData={geoData}
          branchData={branchData}
          competitorData={competitorData}
          stateCompanyCounts={stateCompanyCounts}
          expansionScores={expansionScores}
          demandByState={demandByState}
          onStateClick={setSelectedUf}
          selectedUf={selectedUf}
        />
        <LayerPanel activeLayers={activeLayers} onToggle={toggleLayer} />
        <AnalysisPanel
          selectedState={selectedState}
          activeLayers={activeLayers}
          companyCount={selectedUf ? (stateCompanyCounts[selectedUf] ?? 0) : 0}
          branchCount={selectedUf ? (branchCountsByState[selectedUf] ?? 0) : 0}
          competitorCount={
            selectedUf ? (competitorCountsByState[selectedUf] ?? 0) : 0
          }
          similarity={selectedUf ? (expansionScores[selectedUf] ?? null) : null}
          demandValue={selectedUf ? (demandByState[selectedUf] ?? null) : null}
          regionCompanyCounts={regionCompanyCounts}
        />
        <MapLegend activeLayers={activeLayers} />
      </div>
    </>
  );
}
