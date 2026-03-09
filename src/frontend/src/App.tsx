import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AddMarkerDialog from "./components/AddMarkerDialog";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import type { MarkerWithId } from "./hooks/useQueries";

// Register service worker for offline capability
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed - app still works online
    });
  });
}

export type PendingMarker = {
  lat: number;
  lng: number;
} | null;

export type MapRef = {
  flyTo: (lat: number, lng: number) => void;
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingMarker, setPendingMarker] = useState<PendingMarker>(null);
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "acquiring" | "ok" | "error"
  >("idle");
  const mapRef = useRef<MapRef>(null);

  // Acquire GPS location
  useEffect(() => {
    setLocationStatus("acquiring");
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("ok");
      },
      () => {
        setLocationStatus("error");
        toast.error("GPS unavailable — using default location");
        // Fallback to a default location (New Delhi)
        setUserLocation({ lat: 28.6139, lng: 77.209 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingMarker({ lat, lng });
  }, []);

  const handleFlyTo = useCallback((marker: MarkerWithId) => {
    mapRef.current?.flyTo(marker.lat, marker.lng);
    // Close sidebar on mobile after flying to marker
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background relative">
      {/* Top Bar */}
      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        locationStatus={locationStatus}
        userLocation={userLocation}
        satelliteMode={satelliteMode}
        onToggleSatellite={() => setSatelliteMode((v) => !v)}
        mapRef={mapRef}
      />

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/60 md:hidden w-full h-full cursor-default"
          style={{ border: "none", padding: 0 }}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          tabIndex={-1}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-30 top-0 left-0 h-full
          w-[320px] md:w-[340px] flex-shrink-0
          transition-transform duration-250 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar onFlyTo={handleFlyTo} userLocation={userLocation} />
      </aside>

      {/* Map */}
      <main
        className="flex-1 relative h-full pt-[42px] md:pt-[42px]"
        data-ocid="map.canvas_target"
      >
        <MapView
          ref={mapRef}
          userLocation={userLocation}
          onMapClick={handleMapClick}
          satelliteMode={satelliteMode}
        />
        {/* Floating add marker hint */}
        <div className="absolute bottom-6 right-4 z-10 flex flex-col items-end gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-card/90 border border-primary/40 rounded-sm px-3 py-1.5 backdrop-blur-sm">
            <button
              type="button"
              className="font-mono text-[10px] text-primary uppercase tracking-widest cursor-default select-none"
              data-ocid="map.add_marker_button"
              aria-label="Click on map to add a marker"
              onClick={() => {
                // Show hint - actual marker placement is via map click
                toast("Click anywhere on the map to deploy a marker", {
                  duration: 2000,
                });
              }}
            >
              + CLICK MAP TO DEPLOY MARKER
            </button>
          </div>
        </div>
      </main>

      {/* Add Marker Dialog */}
      <AddMarkerDialog
        pendingMarker={pendingMarker}
        onClose={() => setPendingMarker(null)}
      />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.17 0.008 110)",
            border: "1px solid oklch(0.28 0.012 110)",
            color: "oklch(0.88 0.02 90)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          },
        }}
      />
    </div>
  );
}
