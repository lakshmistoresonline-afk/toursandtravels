# AMBADY — PILGRIMAGE EXPERIENCES

Faith | Heritage | Inner Journeys

This is a complete Firebase-only architecture for the AMBADY Pilgrimage Experiences platform.

## Features
- **Firebase Hosting**: High-performance static hosting for the React SPA.
- **Firebase Auth**: Single login for both Pilgrims and Administrators.
- **Cloud Firestore**: Real-time NoSQL database for users, journeys, and registrations.
- **Firebase Storage**: Secure cloud storage for journey images and pilgrim documents.
- **Security Hardened**: Robust Firestore and Storage rules for granular access control.
- **Responsive Design**: Elegant spiritual aesthetic optimized for all devices.

## Project Structure
- `front-panel/`: The unified React Router v7 application.
- `shared/`: Shared services, schemas, and types.

## Setup Instructions

### 1. Firebase Project
- Use project: `toursandtravels-73c62`.
- Ensure Email/Password Auth is enabled.
- Ensure Cloud Firestore is in Native mode.

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase Web App credentials.

### 3. Install Dependencies
```bash
npm install
```

### 4. Build and Test
```bash
npm run build
npm run dev
```

### 5. Deployment
```bash
firebase deploy
```

## Admin Sanctuary
To access the Admin Sanctuary:
1. Register as a user through the `/signup` page.
2. In Firestore, change the user's `role` to `"admin"`.
3. Refresh the application to access `/admin`.
