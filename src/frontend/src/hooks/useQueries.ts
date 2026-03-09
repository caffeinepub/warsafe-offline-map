import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MarkerType } from "../backend";
import type { Contact, Marker, MarkerId } from "../backend.d.ts";
import { useActor } from "./useActor";

export type MarkerWithId = Marker & { id: MarkerId };

// ─── Queries ────────────────────────────────────────────────────────────────

export function useAllData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allData"],
    queryFn: async () => {
      if (!actor)
        return {
          contacts: [] as Contact[],
          markers: [] as Marker[],
          sosMessage: "",
        };
      return actor.getAllData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkersWithIds() {
  const { actor, isFetching } = useActor();
  return useQuery<MarkerWithId[]>({
    queryKey: ["markersWithIds"],
    queryFn: async () => {
      if (!actor) return [];
      const [markers, ids] = await Promise.all([
        actor.getAllMarkers(),
        actor.getAllMarkerIds(),
      ]);
      return markers.map((marker, i) => ({ ...marker, id: ids[i] }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSOSMessage() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["sosMessage"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getSOSMessage();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useAddMarker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lat,
      lng,
      title,
      markerType,
      notes,
    }: {
      lat: number;
      lng: number;
      title: string;
      markerType: MarkerType;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addMarker(lat, lng, title, markerType, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markersWithIds"] });
      queryClient.invalidateQueries({ queryKey: ["allData"] });
    },
  });
}

export function useDeleteMarker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: MarkerId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMarker(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markersWithIds"] });
      queryClient.invalidateQueries({ queryKey: ["allData"] });
    },
  });
}

export function useAddContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      phoneNumber,
      relationship,
    }: {
      name: string;
      phoneNumber: string;
      relationship: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addContact(name, phoneNumber, relationship);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["allData"] });
    },
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteContact(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["allData"] });
    },
  });
}

export function useUpdateSOSMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMessage: string) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSOSMessage(newMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sosMessage"] });
      queryClient.invalidateQueries({ queryKey: ["allData"] });
    },
  });
}

export { MarkerType };
