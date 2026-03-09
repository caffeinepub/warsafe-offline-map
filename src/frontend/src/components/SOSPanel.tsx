import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertOctagon,
  CheckCircle,
  Clock,
  Copy,
  Crosshair,
  Edit3,
  Loader2,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSOSMessage, useUpdateSOSMessage } from "../hooks/useQueries";

type Props = {
  userLocation: { lat: number; lng: number } | null;
};

const DEFAULT_SOS =
  "MAYDAY MAYDAY MAYDAY. I need immediate assistance. My location is included. Please send help or relay to emergency services.";

export default function SOSPanel({ userLocation }: Props) {
  const { data: savedMessage, isLoading } = useSOSMessage();
  const updateSOS = useUpdateSOSMessage();

  const [editMode, setEditMode] = useState(false);
  const [localMessage, setLocalMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync backend message to local state
  useEffect(() => {
    if (savedMessage !== undefined) {
      setLocalMessage(savedMessage || DEFAULT_SOS);
    }
  }, [savedMessage]);

  const buildFullSOS = () => {
    const now = new Date();
    const coords = userLocation
      ? `${userLocation.lat.toFixed(6)}°N, ${userLocation.lng.toFixed(6)}°E`
      : "COORDINATES UNAVAILABLE";
    const mapsLink = userLocation
      ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : "";

    return [
      "=== SOS EMERGENCY MESSAGE ===",
      "",
      localMessage,
      "",
      "--- POSITION REPORT ---",
      `COORDINATES: ${coords}`,
      `TIMESTAMP: ${now.toUTCString()}`,
      mapsLink ? `MAP LINK: ${mapsLink}` : "",
      "",
      "=== END SOS ===",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildFullSOS());
      setCopied(true);
      toast.success("SOS COPIED TO CLIPBOARD");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = buildFullSOS();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast.success("SOS COPIED");
    }
  };

  const handleSaveMessage = async () => {
    try {
      await updateSOS.mutateAsync(localMessage);
      setEditMode(false);
      toast.success("SOS MESSAGE UPDATED");
    } catch {
      toast.error("SAVE FAILED");
    }
  };

  const now = new Date();

  return (
    <div className="p-3 space-y-3" data-ocid="sos.panel">
      {/* SOS Header - Red alert */}
      <div className="tactical-panel danger rounded-sm p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertOctagon className="h-4 w-4 text-destructive signal-pulse" />
          <span className="font-mono text-[11px] text-destructive uppercase tracking-widest font-bold">
            EMERGENCY SOS
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
          Copies full SOS message with GPS coordinates to clipboard. Share via
          any communication channel.
        </p>
      </div>

      {/* Current Position */}
      <div className="rounded-sm border border-border/50 bg-card/50 p-2 space-y-1">
        <div className="flex items-center gap-1.5">
          <Crosshair className="h-3 w-3 text-primary" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Current Position
          </span>
        </div>
        {userLocation ? (
          <div className="coords text-[11px] pl-4">
            <div>{userLocation.lat.toFixed(6)}°N</div>
            <div>{userLocation.lng.toFixed(6)}°E</div>
            {userLocation && (
              <div className="text-muted-foreground/60 mt-1 text-[9px]">
                maps.google.com/?q={userLocation.lat.toFixed(4)},
                {userLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
        ) : (
          <div className="coords text-[10px] pl-4 text-amber blink">
            ACQUIRING GPS...
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 px-2">
        <Clock className="h-3 w-3 text-muted-foreground/50" />
        <span className="font-mono text-[9px] text-muted-foreground/50">
          {now.toUTCString()}
        </span>
      </div>

      {/* SOS Message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            SOS Message
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 font-mono text-[9px] uppercase tracking-wider hover:bg-secondary hover:text-primary"
            onClick={() => setEditMode((v) => !v)}
          >
            <Edit3 className="h-2.5 w-2.5 mr-1" />
            {editMode ? "CANCEL" : "EDIT"}
          </Button>
        </div>

        {isLoading ? (
          <div className="h-20 bg-secondary/40 animate-pulse rounded-sm" />
        ) : editMode ? (
          <>
            <Textarea
              value={localMessage}
              onChange={(e) => setLocalMessage(e.target.value)}
              className="h-24 font-mono text-xs bg-secondary border-border focus-visible:ring-destructive resize-none"
              maxLength={500}
            />
            <Button
              size="sm"
              className="w-full h-7 font-mono text-[10px] uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/80"
              onClick={handleSaveMessage}
              disabled={updateSOS.isPending}
            >
              {updateSOS.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  SAVE MESSAGE
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="p-2 rounded-sm border border-border/50 bg-secondary/30">
            <p className="font-mono text-[11px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {localMessage || DEFAULT_SOS}
            </p>
          </div>
        )}
      </div>

      {/* Preview of full SOS */}
      <div className="rounded-sm border border-destructive/20 bg-destructive/5 p-2">
        <div className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest mb-1">
          FULL TRANSMISSION PREVIEW
        </div>
        <pre className="font-mono text-[9px] text-foreground/60 whitespace-pre-wrap leading-relaxed overflow-hidden">
          {buildFullSOS().slice(0, 200)}
          {buildFullSOS().length > 200 ? "..." : ""}
        </pre>
      </div>

      {/* COPY SOS Button */}
      <Button
        className={`
          w-full h-10 font-mono text-sm uppercase tracking-widest font-bold
          transition-all duration-200
          ${
            copied
              ? "bg-safe text-safe-foreground hover:bg-safe/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
          }
        `}
        onClick={handleCopy}
        data-ocid="sos.button"
      >
        {copied ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            COPIED!
          </>
        ) : (
          <>
            <AlertOctagon className="h-4 w-4 mr-2" />
            COPY SOS + COORDS
          </>
        )}
      </Button>

      <p className="font-mono text-[9px] text-muted-foreground/40 text-center">
        Share via SMS, WhatsApp, radio, or any messaging app
      </p>

      {/* Footer */}
      <div className="border-t border-border/30 pt-3 mt-3">
        <p className="font-mono text-[9px] text-muted-foreground/30 text-center leading-relaxed">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
