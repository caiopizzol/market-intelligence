import type { LayerType } from "@driva/shared";
import type { Layer, LeafletMouseEvent } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
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
  onStateClick: (uf: string) => void;
  selectedUf: string | null;
}

function makeIcon(color: string, size: number) {
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
  });
}

const branchIcon = makeIcon("#2563eb", 14);
const competitorIcon = makeIcon("#dc2626", 12);

function getColorByCount(count: number, max: number): string {
  if (max === 0) return "#94a3b8";
  const ratio = count / max;
  if (ratio >= 0.6) return "#22c55e";
  if (ratio >= 0.4) return "#84cc16";
  if (ratio >= 0.2) return "#eab308";
  if (ratio > 0) return "#f97316";
  return "#ef4444";
}

function getColorByScore(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
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
  onStateClick,
  selectedUf,
}: MapViewProps) {
  const showHeatmap = activeLayers.has("marketPotential");
  const showBranches = activeLayers.has("branches");
  const showCompetitors = activeLayers.has("competition");

  const hasFilteredData = Object.keys(stateCompanyCounts).length > 0;
  const maxCount = hasFilteredData
    ? Math.max(...Object.values(stateCompanyCounts))
    : 0;

  function style(feature: GeoJSON.Feature | undefined) {
    const uf = feature?.properties?.uf as string;
    const score = feature?.properties?.potentialScore ?? 50;
    const isSelected = uf === selectedUf;
    const count = stateCompanyCounts[uf] ?? 0;

    let fillColor = "#94a3b8";
    let fillOpacity = 0.15;

    if (showHeatmap) {
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
      color: isSelected ? "#111827" : "#ffffff",
      weight: isSelected ? 2.5 : 1.5,
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

  const geoKey = `${showHeatmap}-${selectedUf}-${JSON.stringify(stateCompanyCounts)}`;

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
      </MapContainer>
    </div>
  );
}
