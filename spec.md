# WarSafe Offline Map

## Current State
- Leaflet map with OpenStreetMap tile layer (standard street view)
- TopBar with GPS status, network status, coordinates
- Sidebar with markers panel, contacts, SOS
- Marker add/fly-to functionality

## Requested Changes (Diff)

### Add
- **Satellite view toggle**: Switch between Standard (OSM streets) and Satellite (Esri World Imagery) tile layers. Toggle button on the map or TopBar.
- **Search bar**: Location search input using Nominatim (OpenStreetMap geocoding API -- free, no key needed). User types a place name, gets suggestions, selects one, and map flies to that location.

### Modify
- `MapView.tsx`: Add tile layer switching logic (standard vs satellite refs), expose a `setTileLayer` method or accept a `tileLayer` prop. Add Nominatim search result flyTo support.
- `TopBar.tsx` or map overlay: Add satellite toggle button and search bar UI.

### Remove
- Nothing removed.

## Implementation Plan
1. In `MapView.tsx`:
   - Store both tile layer instances (OSM standard + Esri satellite).
   - Accept a `satelliteMode: boolean` prop; swap active tile layer when it changes.
   - Expose or accept a `flyToSearch` callback for flying to geocoded results.
2. Add a `SearchBar.tsx` component:
   - Input field that queries Nominatim (`https://nominatim.openstreetmap.org/search?format=json&q=...`).
   - Debounced suggestions dropdown.
   - On select: call `mapRef.current.flyTo(lat, lng)`.
3. In `TopBar.tsx`:
   - Add satellite toggle button (e.g. a layers icon) that sets `satelliteMode` state in `App.tsx`.
   - Add `SearchBar` component inline in the TopBar or as a floating overlay on the map.
4. In `App.tsx`:
   - Add `satelliteMode` state, pass down to `MapView` and `TopBar`.
