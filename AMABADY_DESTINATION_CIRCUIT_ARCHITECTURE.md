# Destination Circuit Architecture

## 1. Defining a Circuit
A circuit is a reusable group of destinations (e.g. "Char Dham", "Ashta Vinayak").

## 2. Reusable Component
- A circuit document stores an ordered list of `spotIds`.
- A single `DestinationSpot` can belong to multiple circuits.

## 3. Journey Bootstrapping
The Journey Builder should allow "Starting from a Circuit".
- **Flow**: Select "Jyotirlinga Circuit" -> Itinerary is pre-populated with the 12 master destinations.
- **Independence**: Once a journey is created from a circuit, the journey's stop list can be modified without affecting the original Circuit Master.
