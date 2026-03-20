import type { CounterData } from "@driva/shared";
import { formatCompact } from "../lib/format";

interface CounterBarProps {
  counter: CounterData;
}

export function CounterBar({ counter }: CounterBarProps) {
  return (
    <div className="counter-bar">
      <span className="counter-big">{formatCompact(counter.total)}</span>
      <span className="counter-arrow">&rarr;</span>
      <span className="counter-filtered">
        {formatCompact(counter.filtered)}
      </span>
      <span className="counter-tag">empresas</span>
    </div>
  );
}
