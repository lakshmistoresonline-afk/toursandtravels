# AMABADY — DESTINATION MAP ARCHITECTURE

## 1. Map Foundation
- **Provider**: Mapbox or Google Maps (Standard Firebase/React patterns).
- **Architecture**: The application currently has no explicit map service. This needs to be built as a shared component.

## 2. Global Explorer Features
- **Clustering**: High-density spot areas (e.g., Hampi or Varanasi) should use marker clustering.
- **Filtering**: Live map update when selecting categories (Pilgrimage vs Tourism).
- **Discovery**: "Nearby Destinations" tool using Haversine formula calculation on the client or Firestore geo-queries.

## 3. Journey Route Integration
- Display the journey path connecting `spotId`s in the itinerary.
- Highlight "Detour Destinations" within a 20km radius of the generated route path.
