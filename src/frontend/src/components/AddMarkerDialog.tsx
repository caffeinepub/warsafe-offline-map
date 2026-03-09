import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Loader2,
  MapPin,
  Navigation,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PendingMarker } from "../App";
import { MarkerType, useAddMarker } from "../hooks/useQueries";

type Props = {
  pendingMarker: PendingMarker;
  onClose: () => void;
};

const MARKER_OPTIONS = [
  {
    value: MarkerType.safe,
    label: "SAFE ZONE",
    icon: Shield,
    color: "text-safe",
  },
  {
    value: MarkerType.danger,
    label: "DANGER ZONE",
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    value: MarkerType.waypoint,
    label: "WAYPOINT",
    icon: Navigation,
    color: "text-waypoint",
  },
];

export default function AddMarkerDialog({ pendingMarker, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [markerType, setMarkerType] = useState<MarkerType>(MarkerType.waypoint);
  const [notes, setNotes] = useState("");

  const addMarker = useAddMarker();

  // Reset form when dialog opens
  useEffect(() => {
    if (pendingMarker) {
      setTitle("");
      setMarkerType(MarkerType.waypoint);
      setNotes("");
    }
  }, [pendingMarker]);

  const handleSave = async () => {
    if (!pendingMarker) return;
    if (!title.trim()) {
      toast.error("DESIGNATION REQUIRED");
      return;
    }

    try {
      await addMarker.mutateAsync({
        lat: pendingMarker.lat,
        lng: pendingMarker.lng,
        title: title.trim(),
        markerType,
        notes: notes.trim(),
      });
      toast.success(`MARKER DEPLOYED: ${title.trim()}`);
      onClose();
    } catch {
      toast.error("DEPLOYMENT FAILED — retry");
    }
  };

  const selectedOption = MARKER_OPTIONS.find((o) => o.value === markerType);

  return (
    <Dialog open={!!pendingMarker} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-[360px] p-0 overflow-hidden"
        data-ocid="marker.dialog"
      >
        {/* Tactical header bar */}
        <div className="h-0.5 w-full bg-primary" />

        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 font-mono text-sm tracking-widest text-primary uppercase">
            <MapPin className="h-4 w-4" />
            DEPLOY MARKER
          </DialogTitle>
          {pendingMarker && (
            <p className="coords text-[10px] mt-1">
              {pendingMarker.lat.toFixed(6)}°N &nbsp;{" "}
              {pendingMarker.lng.toFixed(6)}°E
            </p>
          )}
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          {/* Type selector */}
          <div className="space-y-1">
            <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Marker Type
            </Label>
            <Select
              value={markerType}
              onValueChange={(v) => setMarkerType(v as MarkerType)}
            >
              <SelectTrigger className="h-8 font-mono text-xs bg-secondary border-border focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border font-mono text-xs">
                {MARKER_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="focus:bg-secondary"
                  >
                    <div className="flex items-center gap-2">
                      <opt.icon className={`h-3 w-3 ${opt.color}`} />
                      <span className={opt.color}>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label
              htmlFor="marker-title"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest"
            >
              Designation *
            </Label>
            <Input
              id="marker-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., SHELTER ALPHA"
              className="h-8 font-mono text-xs bg-secondary border-border focus-visible:ring-primary placeholder:text-muted-foreground/50 uppercase"
              maxLength={60}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              data-ocid="marker.input"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label
              htmlFor="marker-notes"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest"
            >
              Field Notes
            </Label>
            <Textarea
              id="marker-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Situation report, resources, hazards..."
              className="h-16 font-mono text-xs bg-secondary border-border focus-visible:ring-primary placeholder:text-muted-foreground/50 resize-none"
              maxLength={280}
            />
          </div>

          {/* Marker type indicator */}
          {selectedOption && (
            <div className="flex items-center gap-2 py-1.5 px-2 bg-secondary/50 rounded-sm border border-border/50">
              <selectedOption.icon
                className={`h-3 w-3 ${selectedOption.color}`}
              />
              <span className={`font-mono text-[10px] ${selectedOption.color}`}>
                {selectedOption.label} — READY TO DEPLOY
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 pb-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="font-mono text-[11px] tracking-widest uppercase h-7 border-border hover:bg-secondary"
            data-ocid="marker.cancel_button"
          >
            ABORT
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={addMarker.isPending}
            className="font-mono text-[11px] tracking-widest uppercase h-7 bg-primary text-primary-foreground hover:bg-primary/80"
            data-ocid="marker.save_button"
          >
            {addMarker.isPending ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                DEPLOYING...
              </>
            ) : (
              "DEPLOY"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
