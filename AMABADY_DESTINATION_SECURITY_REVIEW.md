# Destination Security Review

## 1. Access Rules
- **Public**: Read-only access to `VERIFIED` or `PUBLISHED` spots.
- **Admin**: Full CRUD access to all spots.

## 2. Ingestion Security
- The import script should be restricted to administrative users.
- Validation must ensure that only valid geography and category strings are imported.

## 3. Data Integrity
- Use Firestore transactions when linking journeys to spots to ensure consistent reference counts if needed.
