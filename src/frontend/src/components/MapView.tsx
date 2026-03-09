import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { MapRef } from "../App";
import { useMarkersWithIds } from "../hooks/useQueries";

// Leaflet is loaded via CDN script tag in index.html → available as window.L
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;

type Props = {
  userLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  satelliteMode?: boolean;
};

const TILE_OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const TILE_SAT_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const TILE_SAT_ATTRIBUTION =
  '© <a href="https://www.esri.com/">Esri</a> &mdash; World Imagery';

const MapView = forwardRef<MapRef, Props>(
  ({ userLocation, onMapClick, satelliteMode = false }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tileLayerRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markersLayerRef = useRef<Map<string, any>>(new Map());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMarkerRef = useRef<any>(null);
    const onMapClickRef = useRef(onMapClick);
    const { data: markers } = useMarkersWithIds();

    // Keep callback ref up to date
    useEffect(() => {
      onMapClickRef.current = onMapClick;
    }, [onMapClick]);

    // Expose flyTo via ref
    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        }
      },
    }));

    // Initialize map once
    useEffect(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const defaultCenter: [number, number] = [28.6139, 77.209];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      const tileLayer = L.tileLayer(TILE_OSM_URL, {
        attribution: TILE_OSM_ATTRIBUTION,
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    // Switch tile layer when satelliteMode changes
    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove current tile layer
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
        tileLayerRef.current = null;
      }

      const url = satelliteMode ? TILE_SAT_URL : TILE_OSM_URL;
      const attribution = satelliteMode
        ? TILE_SAT_ATTRIBUTION
        : TILE_OSM_ATTRIBUTION;

      const newLayer = L.tileLayer(url, {
        attribution,
        maxZoom: 19,
        crossOrigin: true,
      });

      newLayer.addTo(map);
      newLayer.bringToBack();
      tileLayerRef.current = newLayer;

      // Satellite: lighter filter to show imagery; standard: tactical tint
      const tilePane = map.getPane("tilePane") as HTMLElement | undefined;
      if (tilePane) {
        tilePane.style.filter = satelliteMode
          ? "brightness(0.9) saturate(0.85)"
          : "brightness(0.7) saturate(0.6) hue-rotate(30deg)";
      }
    }, [satelliteMode]);

    // Update user location marker
    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !userLocation) return;

      const dotEl = document.createElement("div");
      dotEl.className = "location-dot";

      const icon = L.divIcon({
        html: dotEl.outerHTML,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const marker = L.marker([userLocation.lat, userLocation.lng], {
          icon,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:monospace;font-size:11px;">
              <div style="color:#86efac;margin-bottom:4px;font-weight:bold;">▶ YOUR POSITION</div>
              <div>${userLocation.lat.toFixed(5)}°N</div>
              <div>${userLocation.lng.toFixed(5)}°E</div>
            </div>`,
            { maxWidth: 160 },
          );
        userMarkerRef.current = marker;
        map.flyTo([userLocation.lat, userLocation.lng], 14, {
          duration: 1.5,
        });
      }
    }, [userLocation]);

    // Sync backend markers to map
    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !markers) return;

      const currentIds = new Set(markers.map((m) => String(m.id)));

      // Remove deleted markers
      for (const [id, leafletMarker] of markersLayerRef.current) {
        if (!currentIds.has(id)) {
          leafletMarker.remove();
          markersLayerRef.current.delete(id);
        }
      }

      // Add new markers
      for (const marker of markers) {
        const id = String(marker.id);
        if (markersLayerRef.current.has(id)) continue;

        const colorMap = {
          safe: { bg: "#4ade80", border: "#86efac", label: "SAFE ZONE" },
          danger: { bg: "#ef4444", border: "#fca5a5", label: "DANGER" },
          waypoint: { bg: "#60a5fa", border: "#93c5fd", label: "WAYPOINT" },
        };

        const type = marker.markerType as keyof typeof colorMap;
        const colors = colorMap[type] || colorMap.waypoint;

        const markerEl = document.createElement("div");
        markerEl.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${colors.bg};
          border: 2px solid ${colors.border};
          box-shadow: 0 0 8px ${colors.bg}80;
        `;

        const icon = L.divIcon({
          html: markerEl.outerHTML,
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const timestamp = new Date(
          Number(marker.timestamp) / 1_000_000,
        ).toLocaleDateString();

        const leafletMarker = L.marker([marker.lat, marker.lng], {
          icon,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:monospace;font-size:11px;min-width:140px;">
              <div style="color:${colors.bg};margin-bottom:4px;font-weight:bold;">▶ ${colors.label}</div>
              <div style="color:#e2e8f0;font-weight:bold;margin-bottom:2px;">${escapeHtml(marker.title)}</div>
              <div style="color:#94a3b8;font-size:10px;">${marker.lat.toFixed(5)}°N, ${marker.lng.toFixed(5)}°E</div>
              ${marker.notes ? `<div style="color:#cbd5e1;margin-top:4px;font-size:10px;">${escapeHtml(marker.notes)}</div>` : ""}
              <div style="color:#64748b;margin-top:4px;font-size:9px;">${timestamp}</div>
            </div>`,
            { maxWidth: 200 },
          );

        markersLayerRef.current.set(id, leafletMarker);
      }
    }, [markers]);

    return (
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ cursor: "crosshair" }}
        aria-label="Tactical map - click to add marker"
      />
    );
  },
);

MapView.displayName = "MapView";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default MapView;
