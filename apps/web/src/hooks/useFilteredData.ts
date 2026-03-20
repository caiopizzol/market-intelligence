import type { CounterData, FilterState } from "@driva/shared";
import { useEffect, useRef, useState } from "react";
import {
  fetchCompaniesByState,
  fetchCompanyCount,
  fetchDemand,
  fetchExpansion,
} from "../lib/api";

interface FilteredData {
  counter: CounterData;
  stateCompanyCounts: Record<string, number>;
  expansionScores: Record<string, number>;
  demandByState: Record<string, number>;
  error: boolean;
}

export function useFilteredData(filters: FilterState): FilteredData {
  const [counter, setCounter] = useState<CounterData>({
    total: 0,
    filtered: 0,
  });
  const [stateCompanyCounts, setStateCompanyCounts] = useState<
    Record<string, number>
  >({});
  const [expansionScores, setExpansionScores] = useState<
    Record<string, number>
  >({});
  const [demandByState, setDemandByState] = useState<Record<string, number>>(
    {},
  );
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const abortRef = useRef<AbortController>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      setError(false);
      Promise.all([
        fetchCompanyCount(filters, signal),
        fetchCompaniesByState(filters, signal),
        fetchExpansion(filters, signal),
        fetchDemand(filters, signal),
      ])
        .then(([c, counts, expansion, demand]) => {
          setCounter(c);
          setStateCompanyCounts(counts);
          const scores: Record<string, number> = {};
          for (const e of expansion) {
            scores[e.uf] = e.similarity;
          }
          setExpansionScores(scores);
          setDemandByState(demand);
        })
        .catch((e) => {
          if (e instanceof DOMException && e.name === "AbortError") return;
          console.error("Filter data fetch failed", e);
          setError(true);
        });
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [filters]);

  return { counter, stateCompanyCounts, expansionScores, demandByState, error };
}
