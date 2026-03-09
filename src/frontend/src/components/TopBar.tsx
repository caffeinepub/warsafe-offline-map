import { Button } from "@/components/ui/button";
import {
  Crosshair,
  Layers,
  MapPin,
  Menu,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import type { MapRef } from "../App";
import SearchBar from "./SearchBar";

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  locationStatus: "idle" | "acquiring" | "ok" | "error";
  userLocation: { lat: number; lng: number } | null;
  satelliteMode: boolean;
  onToggleSatellite: () => void;
  mapRef: React.RefObject<MapRef | null>;
};

export default function TopBar({
  sidebarOpen,
  onToggleSidebar,
  locationStatus,
  userLocation,
  satelliteMode,
  onToggleSatellite,
  mapRef,
}: Props) {
  const now = new Date();
  const timeStr = now.toUTCString().replace("GMT", "UTC").slice(0, 25);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-[42px] flex items-center justify-between px-2 bg-card border-b border-border gap-2">
      {/* Left: Menu + System ID */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-secondary hover:text-primary"
          onClick={onToggleSidebar}
          data-ocid="nav.tab"
          aria-label={sidebarOpen ? "Close panel" : "Open panel"}
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-primary signal-pulse" />
          <span className="text-primary font-mono text-[11px] tracking-widest uppercase font-bold">
            WARMAP-01
          </span>
          <span className="text-muted-foreground font-mono text-[10px] hidden lg:inline">
            {"// TACTICAL NAV SYS"}
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <SearchBar mapRef={mapRef} />
      </div>

      {/* Right: Satellite toggle + Coordinates + Status indicators */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Coordinates — hidden on small screens */}
        <div className="hidden lg:flex items-center gap-1 coords">
          <Crosshair className="h-3 w-3 text-muted-foreground" />
          {userLocation ? (
            <span>
              {userLocation.lat.toFixed(4)}°N&nbsp;
              {userLocation.lng.toFixed(4)}°E
            </span>
          ) : (
            <span className="text-muted-foreground">ACQUIRING...</span>
          )}
        </div>

        {/* Time */}
        <span className="text-muted-foreground font-mono text-[9px] hidden xl:inline">
          {timeStr}
        </span>

        {/* GPS Status */}
        <div className="flex items-center gap-1">
          <MapPin
            className={`h-3 w-3 ${
              locationStatus === "ok"
                ? "text-safe"
                : locationStatus === "acquiring"
                  ? "text-amber"
                  : locationStatus === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
            }`}
          />
          <span
            className={`font-mono text-[9px] uppercase hidden sm:inline ${
              locationStatus === "ok"
                ? "text-safe"
                : locationStatus === "acquiring"
                  ? "text-amber blink"
                  : locationStatus === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
            }`}
          >
            {locationStatus === "ok"
              ? "GPS OK"
              : locationStatus === "acquiring"
                ? "ACQ"
                : locationStatus === "error"
                  ? "ERR"
                  : "GPS"}
          </span>
        </div>

        {/* Network Status */}
        <div className="flex items-center gap-1">
          {navigator.onLine ? (
            <Wifi className="h-3 w-3 text-safe" />
          ) : (
            <WifiOff className="h-3 w-3 text-amber" />
          )}
          <span
            className={`font-mono text-[9px] uppercase hidden sm:inline ${
              navigator.onLine ? "text-safe" : "text-amber"
            }`}
          >
            {navigator.onLine ? "NET" : "OFFL"}
          </span>
        </div>

        {/* Satellite Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 transition-all duration-150 ${
            satelliteMode
              ? "bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary border border-primary/40"
              : "hover:bg-secondary hover:text-primary"
          }`}
          onClick={onToggleSatellite}
          data-ocid="map.satellite_toggle"
          aria-label={
            satelliteMode
              ? "Switch to standard map"
              : "Switch to satellite view"
          }
          title={satelliteMode ? "Standard Map" : "Satellite View"}
        >
          <Layers className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
