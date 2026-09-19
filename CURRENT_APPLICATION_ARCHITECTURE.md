# Current Application Architecture Audit

## 1. Overview
The Amabady application is a modern pilgrimage management platform built using a Firebase-centric architecture. It follows a decoupled pattern with a clear separation between the frontend UI and shared business logic.

## 2. Technology Stack
- **Frontend Framework**: React v19
- **Build Tool**: Rsbuild (Rspack-based)
- **Routing**: React Router v7 (File-based routing in `front-panel/app/routes`)
- **Backend/Database**: Firebase (Firestore, Auth, Storage)
- **Shared Logic**: TypeScript-based service layer and type definitions in the `shared/` workspace.

## 3. Core Architecture
### Frontend (`front-panel`)
- **Framework**: React with Hooks for state management.
- **Styling**: Tailwind CSS with Radix UI components.
- **Data Fetching**: React Router Loaders and Actions, calling methods from the shared service layer.
- **Admin Interface**: Comprehensive dashboard located at `/admin`, with specialized routes for Tour and Booking management.

### Shared Workspace (`shared`)
- **Services**: Decoupled classes for data interaction:
  - `ToursService`: Handles tour creation, updates, and details.
  - `BookingService`: Manages registrations and participant counts.
  - `ResearchService`: Wikipedia-based text synthesis for descriptions.
- **Types**: Centralized `.d.ts` files for consistency across the application.

### Database (`Firebase`)
- **Firestore**: Primary NoSQL database.
- **Authentication**: Email/Password based Auth.
- **Storage**: Used for journey images and documents.

## 4. Current Journey Model
- **Tours**: Stored in a top-level `tours` collection.
- **Destination**: Represented as a plain string (e.g., `"Varanasi, Uttar Pradesh"`) inside each tour document.
- **Itinerary**: Embedded as an array of objects within the tour document or as a legacy sub-collection.

## 5. Architectural Gap
The primary gap is the lack of **Data Reusability**. Destinations are free-text strings rather than references to a Master Inventory. This leads to:
1. Data duplication.
2. Inconsistent naming.
3. Lack of a global search capability for destinations independent of journeys.
