# Destination Data Quality Report

## 1. Missing Fields
- **Coordinates**: 100% missing. `lat` and `lng` must be sourced externally (e.g., via Geocoding).
- **Descriptions**: Master records contain only names and metadata. The detailed `overview` found in current tours is not present.

## 2. Duplicate Detection
- No exact duplicates found by `spotId` or `canonicalName`.
- Alias analysis suggests `Golden Temple` and `Sri Harmandir Sahib` are correctly handled as one record.

## 3. Geographic Errors
- All mapped states and UTs are valid according to the official Indian hierarchy.
- No instances found of a city being mapped to the wrong state.

## 4. Normalization Needs
- **Aliases**: Currently pipe-separated strings (`alias1|alias2`). Must be converted to an array `["alias1", "alias2"]`.
- **Categories**: Mixed casing found in some CSV exports. Must be forced to uppercase.
