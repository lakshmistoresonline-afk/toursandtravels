# Destination Search Architecture

## 1. Multi-Field Indexing
Search should support:
- `canonicalName`
- `aliases`
- `geography.cityLocality`
- `geography.district`
- `geography.stateUT`

## 2. Global Search Flow
1. **Input**: User types "Palani".
2. **Expansion**: Logic checks both `canonicalName` and the `aliases` array.
3. **Filtering**: Allow narrowing by `topCategory` (e.g. Pilgrimage only).
4. **Results**: Return standardized `DestinationSpot` objects.

## 3. Journey Builder Integration
The search component will be reused in the Admin Journey Builder to "Add Stop", ensuring that every stop in a journey is linked to a validated Master Destination.
