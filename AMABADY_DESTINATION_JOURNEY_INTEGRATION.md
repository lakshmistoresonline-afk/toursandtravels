# Destination Journey Integration

## 1. Relational Model
Each `tour` document will reference `spotIds`.
- **Primary Spot**: The main identity of the tour.
- **Stops**: The itinerary days should link to specific `spotIds` from the master list.

## 2. Benefits
- **Consistency**: Changing the name of a spot in the Master updates all referencing journeys.
- **Discovery**: Clicking a destination on a journey page can lead to a "Discover more about this place" page.
- **Auto-Fill**: Selecting a spot in the Journey Builder can automatically pull in its category, region, and metadata.

## 3. Implementation Flow
- Update `ToursService` to include `spotId` in creation logic.
- Update the Tour Details page to fetch the linked `DestinationSpot` metadata.
