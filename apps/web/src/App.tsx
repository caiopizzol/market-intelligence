import type { State } from "@driva/shared";
import { useEffect, useMemo, useState } from "react";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { LayerChips } from "./components/LayerChips";
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
      .catch(() => {});
    fetchBranches()
      .then(setBranchData)
      .catch(() => {});
    fetchCompetitors()
      .then(setCompetitorData)
      .catch(() => {});
  }, []);

  const { counter, stateCompanyCounts } = useFilteredData(filters);

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
      />
      <div className="main">
        <MapView
          activeLayers={activeLayers}
          geoData={geoData}
          branchData={branchData}
          competitorData={competitorData}
          stateCompanyCounts={stateCompanyCounts}
          onStateClick={setSelectedUf}
          selectedUf={selectedUf}
        />
        <LayerChips active={activeLayers} onToggle={toggleLayer} />
        <AnalysisPanel
          selectedState={selectedState}
          companyCount={selectedUf ? (stateCompanyCounts[selectedUf] ?? 0) : 0}
          branchCount={selectedUf ? (branchCountsByState[selectedUf] ?? 0) : 0}
          competitorCount={
            selectedUf ? (competitorCountsByState[selectedUf] ?? 0) : 0
          }
        />
        <MapLegend />
      </div>
    </>
  );
}
