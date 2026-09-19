# AMABADY Data to Application Schema Map

This document maps every field from the supplied source files to the normalized AMBADY application schema.

| SOURCE FIELD (JSON/CSV) | NORMALIZED FIELD | FIRESTORE FIELD | DASHBOARD FIELD |
| :--- | :--- | :--- | :--- |
| `spotId` | `spotId` | `spotId` (Document ID) | Spot ID |
| `canonicalName` | `canonicalName` | `canonicalName` | Canonical Name |
| `aliases` | `aliases` | `aliases` (Array) | Aliases |
| `topCategory` | `domains` / `category` | `domains` (Array), `category` | Domain / Category |
| `subcategory` | `subcategory` | `subcategory` (Array) | Subcategory |
| `region` | `geography.region` | `geography.region` | Region |
| `stateUT` | `geography.stateUT` | `geography.stateUT` | State / UT |
| `district` | `geography.district` | `geography.district` | District |
| `cityLocality` | `geography.cityLocality` | `geography.cityLocality` | City / Town |
| `source` | `verification.notes` | `verification.notes` | Source Information |
| `discoveryStatus` | `verification.status` | `verification.status` | Verification Status |
| `importance` | `importance` | `importance` | Importance / Priority |
| (Derived) | `searchKeywords` | `searchKeywords` (Array) | (Internal Search) |

## Transformation Rules

1.  **Identity Stability**: The provided `spotId` (e.g., `DISC-00001`) is used as the Firestore Document ID for absolute stability across re-imports.
2.  **Alias Normalization**: `aliases` from the master JSON are merged with search terms from `aliases.csv` into a unique array.
3.  **Geography Correction**: A specific patch handles the incorrect mapping of Nagpur in the source data.
4.  **Keyword Generation**: Every record is enriched with a `searchKeywords` array derived from the name, aliases, and geography to enable scalable searching.
5.  **Missing Data**: Fields not present in the source (e.g., `latitude`, `longitude`, `description`) are initialized as empty/null and must be enriched through the Admin Dashboard.
