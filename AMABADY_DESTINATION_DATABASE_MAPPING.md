# Destination Database Mapping

| Harvest Field | Firestore Field | Transformation |
| :--- | :--- | :--- |
| `spotId` | `id` | Direct |
| `canonicalName` | `canonicalName` | Direct |
| `aliases` | `aliases` | `split('|')` |
| `topCategory` | `topCategory` | `toUpperCase()` |
| `stateUT` | `geography.stateUT` | Direct |
| `district` | `geography.district` | Direct |
| `cityLocality` | `geography.cityLocality` | Direct |
| `discoveryStatus` | `verification.discoveryStatus` | Direct |
| `source` | `source` | Direct |

## Migration Impact
- **Database Change**: High. Requires a new collection.
- **API Change**: Medium. `ToursService` must be updated to join tour data with spot data.
- **UI Change**: High. The "Initiate Journey" form must shift from free-text destination to a Searchable Selection.
