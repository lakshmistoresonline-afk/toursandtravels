# Destination Migration Plan

## Phase 1: Preparation
1. Implement the `spots` Firestore collection.
2. Define the new `DestinationSpot` shared type.

## Phase 2: Ingestion
1. Execute the `ingest-harvest-package` script.
2. Manually verify the first 10 records for quality.

## Phase 3: Linking
1. For every existing tour, find the matching `spotId` from the new Master.
2. Update the tour document to reference the `spotId`.

## Phase 4: Deprecation
1. Retire the free-text `destination` field in the tours collection.
