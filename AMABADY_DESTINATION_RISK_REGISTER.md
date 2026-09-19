# Destination Risk Register

| Risk | Probability | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **Incomplete Discovery Data** | High | Medium | Implement an "Enrichment" phase in the Admin UI. |
| **Stale External Sources** | Medium | Low | Record the `retrievedAt` timestamp for each spot. |
| **Database Query Inefficiency** | Low | Medium | Proper indexing and client-side caching of geographic metadata. |
| **Broken Relationships** | Low | High | Ensure cascading checks when archiving or merging master spots. |
