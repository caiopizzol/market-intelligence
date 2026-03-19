import type { CounterData } from "@driva/shared";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

interface CounterBarProps {
  counter: CounterData;
}

export function CounterBar({ counter }: CounterBarProps) {
  return (
    <div className="counter-bar">
      <span className="counter-big">{formatCount(counter.total)}</span>
      <span className="counter-arrow">&rarr;</span>
      <span className="counter-filtered">{formatCount(counter.filtered)}</span>
      <span className="counter-tag">empresas</span>
    </div>
  );
}
