import type { LayerType, State } from "@driva/shared";

interface StateDetailProps {
  state: State;
  activeLayers: Set<LayerType>;
  companyCount: number;
  branchCount: number;
  competitorCount: number;
  similarity: number | null;
  demandValue: number | null;
  regionCompanyCounts: Record<string, number>;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

function fmtCurrency(n: number): string {
  if (n >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${n}`;
}

const regionOrder = ["N", "NE", "CO", "SE", "S"];
const regionFullNames: Record<string, string> = {
  Norte: "N",
  Nordeste: "NE",
  "Centro-Oeste": "CO",
  Sudeste: "SE",
  Sul: "S",
};

export function StateDetail({
  state,
  activeLayers,
  companyCount,
  branchCount,
  competitorCount,
  similarity,
  demandValue,
  regionCompanyCounts,
}: StateDetailProps) {
  const showExpansion = activeLayers.has("expansion");
  const showDemand = activeLayers.has("demand");
  const showCompetitors = activeLayers.has("competition");
  const showBranches = activeLayers.has("branches");

  // Build insight text
  let insight: string | null = null;
  let insightColor = "amber";
  if (showExpansion && similarity !== null && similarity > 0) {
    const parts = [
      `${state.name} tem perfil ${similarity}% similar aos seus mercados ativos`,
    ];
    if (demandValue && showDemand) {
      parts[0] += ` com ${fmtCurrency(demandValue)} em demanda estimada`;
    }
    if (branchCount === 0 && competitorCount === 0) {
      parts.push("Zero presenca — blue ocean.");
    } else if (similarity >= 75) {
      parts.push("Forte candidato para expansao.");
    }
    insight = parts.join(". ");
  } else if (branchCount > 0 && showExpansion) {
    insight = `Voce ja tem ${branchCount} filial${branchCount > 1 ? "is" : ""} em ${state.name} — mercado ativo.`;
    insightColor = "green";
  }

  // Region chart data
  const regionAbbr = regionFullNames[state.region] ?? "";
  const maxRegionCount = Math.max(...Object.values(regionCompanyCounts), 1);

  return (
    <div className="sc">
      <div className="sc-header">
        <div>
          <div className="sc-name">{state.name}</div>
          <div className="sc-region">
            {state.region} &middot; {state.uf}
          </div>
        </div>
        {showExpansion && similarity !== null && similarity > 0 && (
          <div className="sc-badge amber">{similarity}% similar</div>
        )}
      </div>

      <div className="sc-body">
        <div className="sc-row">
          <span className="sc-row-label">Populacao</span>
          <span className="sc-row-val">{fmt(state.population)}</span>
        </div>
        <div className="sc-row">
          <span className="sc-row-label">PIB per capita</span>
          <span className="sc-row-val">R$ {fmt(state.gdpPerCapita)}</span>
        </div>
        <div className="sc-row">
          <span className="sc-row-label">Empresas</span>
          <span className="sc-row-val accent">{companyCount}</span>
        </div>
        {showDemand && demandValue !== null && demandValue > 0 && (
          <div className="sc-row">
            <span className="sc-row-label">Demanda estimada</span>
            <span className="sc-row-val purple">
              {fmtCurrency(demandValue)}
            </span>
          </div>
        )}
        {showBranches && (
          <div className="sc-row">
            <span className="sc-row-label">Filiais</span>
            <span className="sc-row-val">{branchCount}</span>
          </div>
        )}
        {showCompetitors && (
          <div className="sc-row">
            <span className="sc-row-label">Concorrentes</span>
            <span className="sc-row-val red">{competitorCount}</span>
          </div>
        )}

        {Object.keys(regionCompanyCounts).length > 0 && (
          <div className="sc-chart">
            <div className="sc-chart-title">Empresas por regiao</div>
            <div className="sc-bars">
              {regionOrder.map((r) => {
                const count = regionCompanyCounts[r] ?? 0;
                const height =
                  maxRegionCount > 0 ? (count / maxRegionCount) * 100 : 0;
                const isThis = r === regionAbbr;
                return (
                  <div key={r} className="sc-bar-col">
                    <div
                      className={`sc-bar ${isThis ? "hi" : ""}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className={`sc-bar-label ${isThis ? "hi" : ""}`}>
                      {r}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {insight && (
          <div className={`sc-insight ${insightColor}`}>{insight}</div>
        )}
      </div>
    </div>
  );
}
