/**
 * Color constants matching CSS variables in index.css.
 * Used where Leaflet/JS APIs need hex values directly.
 */
export const colors = {
  primary: "#111827",
  accent: "#2563eb",
  surface: "#ffffff",
  red: "#dc2626",
  amber: "#d97706",
  amberSoft: "#fffbeb",
  purple: "#7c3aed",
  borderLight: "#cbd5e1",
  neutral: "#94a3b8",
  heatmap: {
    high: "#22c55e",
    midHigh: "#84cc16",
    mid: "#eab308",
    midLow: "#f97316",
    low: "#ef4444",
  },
} as const;
