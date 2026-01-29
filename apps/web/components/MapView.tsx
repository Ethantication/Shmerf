"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface RegionScoreFeature {
  region_id: string;
  name: string;
  country_code: string;
  lat: number;
  lon: number;
  risk_score: number;
  confidence: number;
  drivers: Record<string, number>;
  created_at: string;
}

interface MapViewProps {
  data: RegionScoreFeature[];
  onSelect: (feature: RegionScoreFeature | null) => void;
}

const colorStops = [
  [0, "#0f172a"],
  [0.2, "#1e3a8a"],
  [0.4, "#0369a1"],
  [0.6, "#f97316"],
  [0.8, "#ef4444"],
  [1, "#991b1b"],
];

export default function MapView({ data, onSelect }: MapViewProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<RegionScoreFeature | null>(null);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: data.map((item) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lon, item.lat],
        },
        properties: item,
      })),
    }),
    [data]
  );

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-30, 20],
      zoom: 1.2,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource("regions", {
        type: "geojson",
        data: geojson as GeoJSON.FeatureCollection,
      });

      map.addLayer({
        id: "risk-layer",
        type: "circle",
        source: "regions",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "risk_score"], 0, 4, 1, 16],
          "circle-color": ["interpolate", ["linear"], ["get", "risk_score"], ...colorStops.flat()],
          "circle-opacity": 0.8,
          "circle-stroke-color": "#0f172a",
          "circle-stroke-width": 1,
        },
      });

      map.on("mousemove", "risk-layer", (event) => {
        const feature = event.features?.[0] as maplibregl.MapboxGeoJSONFeature | undefined;
        if (feature?.properties) {
          setHover(feature.properties as RegionScoreFeature);
        }
      });

      map.on("mouseleave", "risk-layer", () => {
        setHover(null);
      });

      map.on("click", "risk-layer", (event) => {
        const feature = event.features?.[0] as maplibregl.MapboxGeoJSONFeature | undefined;
        if (feature?.properties) {
          onSelect(feature.properties as RegionScoreFeature);
        }
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [geojson, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const source = map.getSource("regions") as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson as GeoJSON.FeatureCollection);
    }
  }, [geojson]);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-slate-800">
      <div ref={mapContainer} className="h-full w-full" />
      {hover && (
        <div className="absolute left-4 top-4 rounded-lg bg-slate-950/80 p-3 text-xs text-slate-200 shadow">
          <div className="text-sm font-semibold text-white">{hover.name}</div>
          <div>Risk score: {(hover.risk_score * 100).toFixed(1)}%</div>
          <div>Confidence: {(hover.confidence * 100).toFixed(0)}%</div>
          <div className="text-slate-400">Updated {new Date(hover.created_at).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
