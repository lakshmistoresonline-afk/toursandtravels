# AMABADY Destination Final Acceptance Gap Matrix

| Area | Requirement | Current implementation | Evidence | Status | Required action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Identity | spotId === Document ID | Partially implemented in script but service used addDoc previously. | `spots.service.ts`, `ingest-destinations.cjs` | ✅ FIXED | Ensure service always uses setDoc with spotId. |
| Search | Multi-keyword support | Single-word `array-contains` query. | `spots.service.ts` | ⚠️ PARTIAL | Improve to handle multi-word refinement and documentation of limits. |
| Pagination | Exact Total Count | Returns current page size as total. | `spots.service.ts` | ❌ FAIL | Implement better total estimation or separate count query. |
| Verification | Lifecycle Transitions | State machine defined but not enforced in service logic. | `spots.service.ts` | ❌ FAIL | Add transition validation logic to `SpotsService`. |
| Status | Contradiction Prevention | Contradictions between `status` and `verification.status` possible. | `spots.service.ts`, `spot.schema.ts` | ❌ FAIL | Synchronize statuses or define invariants. |
| Data | Geographic Coverage | Seed dataset of 116 records; heavily South India biased. | `coverage-report.cjs` | ⚠️ PARTIAL | Acknowledge as "Seed" inventory. |
| Data | Quality | All 116 records missing descriptions. | `quality-audit.cjs` | ⚠️ PARTIAL | Enrichment required via Admin UI. |
| Circuits | End-to-End CRUD | Architecture and Table exist, but Creation UI is disabled. | `circuits.tsx` | ⚠️ PARTIAL | Enable basic Circuit creation/edit if safe. |
| Security | Public Read Protection | Public can read all spots regardless of status. | `firestore.rules` | ⚠️ PARTIAL | Restrict public read to `PUBLISHED` status. |
| Search UI | No initial full download | debounced search implemented. | `SpotSearch.tsx` | ✅ PASS | Verified in code. |
