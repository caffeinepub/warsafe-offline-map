import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertOctagon, MapPin, Users } from "lucide-react";
import type { MarkerWithId } from "../hooks/useQueries";
import ContactsPanel from "./ContactsPanel";
import MarkersPanel from "./MarkersPanel";
import SOSPanel from "./SOSPanel";

type Props = {
  onFlyTo: (marker: MarkerWithId) => void;
  userLocation: { lat: number; lng: number } | null;
};

export default function Sidebar({ onFlyTo, userLocation }: Props) {
  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-border">
      {/* Sidebar header */}
      <div className="flex-shrink-0 px-3 pt-[50px] pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary signal-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            TACTICAL CONSOLE
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="markers" className="flex flex-col flex-1 min-h-0">
        <TabsList className="flex-shrink-0 grid grid-cols-3 h-9 bg-secondary/50 rounded-none border-b border-border mx-0 px-0">
          <TabsTrigger
            value="markers"
            className="font-mono text-[10px] uppercase tracking-wider rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full"
            data-ocid="nav.tab"
          >
            <MapPin className="h-3 w-3 mr-1" />
            ZONES
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="font-mono text-[10px] uppercase tracking-wider rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full"
            data-ocid="nav.tab"
          >
            <Users className="h-3 w-3 mr-1" />
            COMMS
          </TabsTrigger>
          <TabsTrigger
            value="sos"
            className="font-mono text-[10px] uppercase tracking-wider rounded-none data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground h-full"
            data-ocid="nav.tab"
          >
            <AlertOctagon className="h-3 w-3 mr-1" />
            SOS
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          <TabsContent value="markers" className="h-full mt-0">
            <ScrollArea className="h-full">
              <MarkersPanel onFlyTo={onFlyTo} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contacts" className="h-full mt-0">
            <ScrollArea className="h-full">
              <ContactsPanel />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sos" className="h-full mt-0">
            <ScrollArea className="h-full">
              <SOSPanel userLocation={userLocation} />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
