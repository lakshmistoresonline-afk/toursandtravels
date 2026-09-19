# Destination Import Architecture

## 1. Batch Ingestion Script
A Node.js script (using `firebase-admin`) to process the harvest package.
- **Source**: `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/01_MASTER/destinations.json`
- **Logic**:
  1. Read JSON.
  2. Map fields according to `AMABADY_DESTINATION_DATABASE_MAPPING.md`.
  3. Chunk into batches of 500 for Firestore efficiency.
  4. Use `set({ ... }, { merge: true })` to avoid overwriting manually enriched data.

## 2. Integrity Checks
- Ensure `stateUT` matches the list in `02_GEOGRAPHY/states_ut.csv`.
- Prevent duplicate `spotId` entries.
