# Destination Verification System

## 1. Lifecycle States
- **DISCOVERED**: Initial state from the harvest package.
- **PENDING**: Manually added by admin, awaiting data completion.
- **VERIFIED**: Canonical name, geography, and categories confirmed.
- **PUBLISHED**: Ready for public discovery and journey inclusion.

## 2. Admin Workflow
1. **Import**: Bulk ingestion from discovery package.
2. **Enrichment**: Admin adds specific pilgrimage/tourism details.
3. **Shortlisting**: Mark as "MAJOR" for priority in search.
4. **Verification**: Final approval for production use.

## 3. Data Protection
Master records should retain a `locked` flag once verified to prevent accidental overwriting by future bulk imports.
