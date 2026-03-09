import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Marker {
    lat: number;
    lng: number;
    title: string;
    notes: string;
    timestamp: bigint;
    markerType: MarkerType;
}
export type MarkerId = bigint;
export interface Contact {
    relationship: string;
    name: string;
    phoneNumber: string;
}
export enum MarkerType {
    danger = "danger",
    safe = "safe",
    waypoint = "waypoint"
}
export interface backendInterface {
    addContact(name: string, phoneNumber: string, relationship: string): Promise<void>;
    addMarker(lat: number, lng: number, title: string, markerType: MarkerType, notes: string): Promise<MarkerId>;
    deleteContact(name: string): Promise<void>;
    deleteMarker(id: MarkerId): Promise<void>;
    getAllContacts(): Promise<Array<Contact>>;
    getAllData(): Promise<{
        contacts: Array<Contact>;
        markers: Array<Marker>;
        sosMessage: string;
    }>;
    getAllMarkerIds(): Promise<Array<MarkerId>>;
    getAllMarkers(): Promise<Array<Marker>>;
    getContact(name: string): Promise<Contact>;
    getMarker(id: MarkerId): Promise<Marker>;
    getMarkersByType(markerType: MarkerType): Promise<Array<Marker>>;
    getSOSMessage(): Promise<string>;
    updateContact(name: string, newPhoneNumber: string, newRelationship: string): Promise<void>;
    updateMarker(id: MarkerId, lat: number, lng: number, title: string, markerType: MarkerType, notes: string): Promise<void>;
    updateSOSMessage(newMessage: string): Promise<void>;
}
