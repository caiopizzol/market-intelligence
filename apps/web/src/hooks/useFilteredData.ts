import type { CounterData, FilterState } from "@driva/shared";
import { useEffect, useRef, useState } from "react";
import { fetchCompaniesByState, fetchCompanyCount } from "../lib/api";

interface FilteredData {
  counter: CounterData;
  stateCompanyCounts: Record<string, number>;
}

export function useFilteredData(filters: FilterState): FilteredData {
  const [counter, setCounter] = useState<CounterData>({
    total: 0,
    filtered: 0,
  });
  const [stateCompanyCounts, setStateCompanyCounts] = useState<
    Record<string, number>
  >({});
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      Promise.all([fetchCompanyCount(filters), fetchCompaniesByState(filters)])
        .then(([c, counts]) => {
          setCounter(c);
          setStateCompanyCounts(counts);
        })
        .catch(() => {
          // Keep previous data on error
        });
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [filters]);

  return { counter, stateCompanyCounts };
}
