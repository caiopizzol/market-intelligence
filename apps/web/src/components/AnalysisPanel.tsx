import type { LayerType, State } from "@driva/shared";
import { StateDetail } from "./StateDetail";

interface AnalysisPanelProps {
  selectedState: State | null;
  activeLayers: Set<LayerType>;
  companyCount: number;
  branchCount: number;
  competitorCount: number;
  similarity: number | null;
  demandValue: number | null;
  regionCompanyCounts: Record<string, number>;
}

export function AnalysisPanel({
  selectedState,
  activeLayers,
  companyCount,
  branchCount,
  competitorCount,
  similarity,
  demandValue,
  regionCompanyCounts,
}: AnalysisPanelProps) {
  if (!selectedState) {
    return (
      <div className="analysis-panel">
        <div className="ap-empty">Clique em um estado para ver detalhes</div>
      </div>
    );
  }

  return (
    <div className="analysis-panel">
      <StateDetail
        state={selectedState}
        activeLayers={activeLayers}
        companyCount={companyCount}
        branchCount={branchCount}
        competitorCount={competitorCount}
        similarity={similarity}
        demandValue={demandValue}
        regionCompanyCounts={regionCompanyCounts}
      />
    </div>
  );
}
