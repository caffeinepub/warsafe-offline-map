import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Loader2,
  Navigation,
  Shield,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  MarkerType,
  useDeleteMarker,
  useMarkersWithIds,
} from "../hooks/useQueries";
import type { MarkerWithId } from "../hooks/useQueries";

type Props = {
  onFlyTo: (marker: MarkerWithId) => void;
};

const TYPE_CONFIG = {
  [MarkerType.safe]: {
    icon: Shield,
    label: "SAFE",
    color: "text-safe",
    dot: "bg-safe",
    border: "border-safe/30",
  },
  [MarkerType.danger]: {
    icon: AlertTriangle,
    label: "DANGER",
    color: "text-destructive",
    dot: "bg-destructive",
    border: "border-destructive/30",
  },
  [MarkerType.waypoint]: {
    icon: Navigation,
    label: "WPT",
    color: "text-waypoint",
    dot: "bg-waypoint",
    border: "border-waypoint/30",
  },
};

export default function MarkersPanel({ onFlyTo }: Props) {
  const { data: markers, isLoading } = useMarkersWithIds();
  const deleteMarker = useDeleteMarker();

  const handleDelete = async (id: bigint, title: string) => {
    try {
      await deleteMarker.mutateAsync(id);
      toast.success(`MARKER REMOVED: ${title}`);
    } catch {
      toast.error("DELETE FAILED");
    }
  };

  return (
    <div className="p-2 space-y-1" data-ocid="marker.list">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-1.5 border-b border-border/50 mb-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Field Markers
        </span>
        <span className="font-mono text-[10px] text-primary">
          {markers?.length ?? 0} DEPLOYED
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div data-ocid="marker.loading_state" className="space-y-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full bg-secondary/60" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!markers || markers.length === 0) && (
        <div
          data-ocid="marker.empty_state"
          className="flex flex-col items-center justify-center py-10 text-center"
        >
          <Target className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="font-mono text-[11px] text-muted-foreground uppercase">
            No markers deployed
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
            Click map to add
          </p>
        </div>
      )}

      {/* Marker list */}
      {markers?.map((marker, i) => {
        const config =
          TYPE_CONFIG[marker.markerType as MarkerType] ||
          TYPE_CONFIG[MarkerType.waypoint];
        const Icon = config.icon;
        const timestamp = new Date(Number(marker.timestamp) / 1_000_000);

        return (
          <div
            key={String(marker.id)}
            data-ocid={`marker.item.${i + 1}`}
            className={`
              group relative flex items-center gap-2 rounded-sm
              border ${config.border} bg-card/50
              hover:bg-secondary/60 transition-colors
            `}
          >
            {/* Clickable fly-to area */}
            <button
              type="button"
              className="flex-1 flex items-center gap-2 p-2 text-left min-w-0 bg-transparent cursor-pointer"
              onClick={() => onFlyTo(marker)}
              aria-label={`Fly to ${marker.title}`}
            >
              {/* Type indicator */}
              <div
                className={`w-1 self-stretch rounded-full ${config.dot} opacity-70 flex-shrink-0`}
              />
              {/* Icon */}
              <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${config.color}`} />
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-[10px] uppercase font-bold ${config.color}`}
                  >
                    [{config.label}]
                  </span>
                  <span className="font-mono text-xs text-foreground truncate">
                    {marker.title}
                  </span>
                </div>
                <div className="coords text-[9px] text-muted-foreground/70 mt-0.5">
                  {marker.lat.toFixed(4)}°N {marker.lng.toFixed(4)}°E
                </div>
                {marker.notes && (
                  <div className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">
                    {marker.notes}
                  </div>
                )}
                <div className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">
                  {timestamp.toLocaleDateString()}{" "}
                  {timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </button>

            {/* Delete button - separate from fly-to */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-1 opacity-0 group-hover:opacity-100 flex-shrink-0 hover:bg-destructive/20 hover:text-destructive transition-all"
              onClick={() => {
                handleDelete(marker.id, marker.title);
              }}
              disabled={deleteMarker.isPending}
              data-ocid={`marker.delete_button.${i + 1}`}
              aria-label={`Delete ${marker.title}`}
            >
              {deleteMarker.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        );
      })}

      {/* Hint */}
      {!isLoading && markers && markers.length > 0 && (
        <p className="font-mono text-[9px] text-muted-foreground/40 text-center pt-2 pb-1">
          CLICK MARKER TO FLY TO LOCATION
        </p>
      )}
    </div>
  );
}
