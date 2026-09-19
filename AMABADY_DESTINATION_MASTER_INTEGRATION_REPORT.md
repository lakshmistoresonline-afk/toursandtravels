# Amabady Destination Master Integration Report

## 1. Executive Summary
This report summarizes the forensic audit and proposed architecture for integrating a reusable Destination Master into the Amabady application. The current journey-centric model, while functional, lacks the reusability required for scale. By introducing a centralized `spots` collection, we can empower the application with a rich Journey Library and a powerful Journey Builder.

## 2. Forensic Findings
- **Stack**: Modern React/Firebase app with a clean service layer.
- **Current Model**: Destinations are plain text within tours.
- **Dataset**: 116 unique spots discovered in the harvest package, covering 26 States/UTs.
- **Modifications**: Recent sessions fixed API issues but did not touch destination integration.

## 3. Recommended Architecture
- **Master Data**: A new `spots` collection for canonical destination entities.
- **Relational Integration**: Tours reference `spotId`s.
- **No-Map Policy**: Geography is maintained as metadata only (State/District/City), with no visualization or geofencing.

## 4. Key Gaps & Solutions
- **Gap**: Duplication of destination data across tours.
- **Solution**: Centralized `spots` collection with a Searchable Selection UI.
- **Gap**: Missing coordinates in harvest data.
- **Solution**: Enrichment via Admin UI or external geocoding (manual).

## 5. Implementation Phases
1. Ingest discovery data into Firestore.
2. Build Admin Destination management.
3. Integrate Spot selection into Journey creation.
4. Build reusable Circuit templates.

## 6. Acceptance Criteria
- [ ] Admin can browse 100+ master destinations.
- [ ] Admin can create a tour stop by selecting a spot from the master list.
- [ ] Users can browse pilgrimage journeys by State, District, or Religion.
- [ ] Multiple journeys can reference the exact same "Palani Murugan Temple" master record.

---
*End of Phase 0 Report*
