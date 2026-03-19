import type { State } from "@driva/shared";
import { StateDetail } from "./StateDetail";

interface AnalysisPanelProps {
  selectedState: State | null;
  companyCount: number;
  branchCount: number;
  competitorCount: number;
}

export function AnalysisPanel({
  selectedState,
  companyCount,
  branchCount,
  competitorCount,
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
        companyCount={companyCount}
        branchCount={branchCount}
        competitorCount={competitorCount}
      />
    </div>
  );
}
