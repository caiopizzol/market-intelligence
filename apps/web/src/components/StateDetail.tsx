import type { State } from "@driva/shared";

interface StateDetailProps {
  state: State;
  companyCount: number;
  branchCount: number;
  competitorCount: number;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

export function StateDetail({
  state,
  companyCount,
  branchCount,
  competitorCount,
}: StateDetailProps) {
  return (
    <div className="ap-detail">
      <div className="ap-detail-name">{state.name}</div>
      <div className="ap-detail-region">
        {state.region} &middot; {state.uf}
      </div>
      <div className="ap-metrics">
        <div className="apm">
          <div className="apm-val">{fmt(state.population)}</div>
          <div className="apm-lbl">População</div>
        </div>
        <div className="apm">
          <div className="apm-val">R$ {fmt(state.gdpPerCapita)}</div>
          <div className="apm-lbl">PIB per capita</div>
        </div>
        <div className="apm">
          <div className="apm-val hi">{companyCount}</div>
          <div className="apm-lbl">Empresas</div>
        </div>
      </div>
      <div className="ap-metrics" style={{ marginTop: 8 }}>
        <div className="apm">
          <div className="apm-val">{branchCount}</div>
          <div className="apm-lbl">Filiais</div>
        </div>
        <div className="apm">
          <div className="apm-val">{competitorCount}</div>
          <div className="apm-lbl">Concorrentes</div>
        </div>
      </div>
    </div>
  );
}
