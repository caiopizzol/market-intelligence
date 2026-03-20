import type { LayerType } from "@driva/shared";
import type { Layer, LeafletMouseEvent } from "leaflet";
import L from "leaflet";
import { colors } from "../lib/colors";
import { formatCurrency } from "../lib/format";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

interface MapViewProps {
  activeLayers: Set<LayerType>;
  geoData: GeoJSON.FeatureCollection | null;
  branchData: GeoJSON.FeatureCollection | null;
  competitorData: GeoJSON.FeatureCollection | null;
  stateCompanyCounts: Record<string, number>;
  expansionScores: Record<string, number>;
  demandByState: Record<string, number>;
  onStateClick: (uf: string) => void;
  selectedUf: string | null;
}

function makeIcon(color: string, size: number) {
  return L.divIcon({
    className: "map-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${colors.surface};box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
  });
}

const branchIcon = makeIcon(colors.accent, 14);
const competitorIcon = makeIcon(colors.red, 12);

function getColorByCount(count: number, max: number): string {
  if (max === 0) return colors.neutral;
  const ratio = count / max;
  if (ratio >= 0.6) return colors.heatmap.high;
  if (ratio >= 0.4) return colors.heatmap.midHigh;
  if (ratio >= 0.2) return colors.heatmap.mid;
  if (ratio > 0) return colors.heatmap.midLow;
  return colors.heatmap.low;
}

function getColorByScore(score: number): string {
  if (score >= 80) return colors.heatmap.high;
  if (score >= 60) return colors.heatmap.midHigh;
  if (score >= 40) return colors.heatmap.mid;
  if (score >= 20) return colors.heatmap.midLow;
  return colors.heatmap.low;
}

function MapControls() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);

  return (
    <div className="map-zoom">
      <button type="button" onClick={() => map.zoomIn()}>
        +
      </button>
      <button type="button" onClick={() => map.zoomOut()}>
        &minus;
      </button>
    </div>
  );
}

export function MapView({
  activeLayers,
  geoData,
  branchData,
  competitorData,
  stateCompanyCounts,
  expansionScores,
  demandByState,
  onStateClick,
  selectedUf,
}: MapViewProps) {
  const showHeatmap = activeLayers.has("marketPotential");
  const showBranches = activeLayers.has("branches");
  const showCompetitors = activeLayers.has("competition");
  const showExpansion = activeLayers.has("expansion");
  const showDemand = activeLayers.has("demand");

  const hasFilteredData = Object.keys(stateCompanyCounts).length > 0;
  const maxCount = hasFilteredData
    ? Math.max(...Object.values(stateCompanyCounts))
    : 0;

  function style(feature: GeoJSON.Feature | undefined) {
    const uf = feature?.properties?.uf as string;
    const score = feature?.properties?.potentialScore ?? 50;
    const isSelected = uf === selectedUf;
    const count = stateCompanyCounts[uf] ?? 0;
    const expansionSim = expansionScores[uf] ?? 0;

    let fillColor = colors.neutral;
    let fillOpacity = 0.15;
    let borderColor = isSelected ? colors.primary : colors.surface;
    let borderWidth = isSelected ? 2.5 : 1.5;
    let dashArray: string | undefined;

    if (showExpansion) {
      if (expansionSim > 0) {
        fillColor = colors.amber;
        fillOpacity = 0.15 + (expansionSim / 100) * 0.55;
        borderColor = isSelected ? colors.primary : colors.amber;
        borderWidth = isSelected ? 2.5 : 1.5;
        dashArray = isSelected ? undefined : "6 3";
      } else {
        fillColor = colors.neutral;
        fillOpacity = 0.08;
        borderColor = isSelected ? colors.primary : colors.borderLight;
        borderWidth = isSelected ? 2.5 : 1;
      }
    } else if (showHeatmap) {
      fillColor = hasFilteredData
        ? getColorByCount(count, maxCount)
        : getColorByScore(score);
      fillOpacity = hasFilteredData
        ? Math.max(0.15, (count / Math.max(maxCount, 1)) * 0.7)
        : 0.5;
    }

    return {
      fillColor,
      fillOpacity,
      color: borderColor,
      weight: borderWidth,
      dashArray,
    };
  }

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const props = feature.properties;
    if (!props) return;

    layer.on({
      click: (_e: LeafletMouseEvent) => {
        onStateClick(props.uf);
      },
    });
  }

  const branchFeatures = branchData?.features ?? [];
  const competitorFeatures = competitorData?.features ?? [];

  // Compute approximate center of each state for demand bubbles
  const stateCenters = useMemo(() => {
    if (!geoData) return {};
    const centers: Record<string, [number, number]> = {};
    for (const f of geoData.features) {
      const uf = f.properties?.uf as string;
      if (!uf) continue;
      const bounds = L.geoJSON(f).getBounds();
      const center = bounds.getCenter();
      centers[uf] = [center.lat, center.lng];
    }
    return centers;
  }, [geoData]);

  const maxDemand = useMemo(() => {
    const vals = Object.values(demandByState);
    return vals.length > 0 ? Math.max(...vals) : 0;
  }, [demandByState]);

  const geoKey = `${showHeatmap}-${showExpansion}-${selectedUf}-${JSON.stringify(stateCompanyCounts)}-${JSON.stringify(expansionScores)}`;

  return (
    <div className="map-container">
      <MapContainer
        center={[-14.5, -51.0]}
        zoom={4}
        zoomControl={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <MapControls />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          opacity={0.4}
        />
        {geoData && (
          <GeoJSON
            key={geoKey}
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={(cluster: L.MarkerCluster) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div class="cluster-icon">${count}</div>`,
              className: "",
              iconSize: L.point(36, 36),
              iconAnchor: L.point(18, 18),
            });
          }}
        >
          {showBranches &&
            branchFeatures.map((f) => {
              const coords = (f.geometry as GeoJSON.Point).coordinates;
              const p = f.properties;
              if (!p) return null;
              return (
                <Marker
                  key={p.id}
                  position={[coords[1], coords[0]]}
                  icon={branchIcon}
                >
                  <Popup>
                    <strong>{p.name}</strong>
                    <br />
                    {p.city}, {p.uf}
                    <br />
                    Desde {new Date(p.openedAt).getFullYear()}
                  </Popup>
                </Marker>
              );
            })}
          {showCompetitors &&
            competitorFeatures.map((f) => {
              const coords = (f.geometry as GeoJSON.Point).coordinates;
              const p = f.properties;
              if (!p) return null;
              return (
                <Marker
                  key={p.id}
                  position={[coords[1], coords[0]]}
                  icon={competitorIcon}
                >
                  <Popup>
                    <strong>{p.name}</strong>
                    <br />
                    {p.city}, {p.uf}
                  </Popup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
        {showDemand &&
          Object.entries(demandByState).map(([uf, value]) => {
            const center = stateCenters[uf];
            if (!center || value === 0) return null;
            const radius = 10 + (value / Math.max(maxDemand, 1)) * 35;
            const label = formatCurrency(value);
            return (
              <CircleMarker
                key={`demand-${uf}`}
                center={center}
                radius={radius}
                pathOptions={{
                  color: "transparent",
                  fillColor: colors.purple,
                  fillOpacity: 0.18,
                }}
              >
                <Popup>
                  <strong>{label}</strong>
                  <br />
                  Demanda estimada
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}
