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
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      Promise.all([
        fetchCompanyCount(filters),
        fetchCompaniesByState(filters),
        fetchExpansion(filters),
        fetchDemand(filters),
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
        .catch(() => {});
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [filters]);

  return { counter, stateCompanyCounts, expansionScores, demandByState };
}
