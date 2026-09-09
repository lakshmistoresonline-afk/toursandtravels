# WanderNest — Simple Tour Management System (Firebase Edition)

This is a complete Firebase-only architecture for the WanderNest Tour Management System.

## Features
- **Firebase Hosting**: High-performance static hosting for the React SPA.
- **Firebase Auth**: Single login for both Customers and Administrators.
- **Cloud Firestore**: Real-time NoSQL database for users, tours, and registrations.
- **Firebase Storage**: Cloud storage for tour images.
- **Role-Based Security**: Hardened Firestore rules for admin and user access control.
- **Spark-Friendly**: Optimized to run within Firebase's no-cost tier.

## Project Structure
- `front-panel/`: The unified React Router v7 application (includes both User and Admin interfaces).
- `shared/`: Shared services and types.

## Setup Instructions

### 1. Firebase Project
- Use existing project: `toursandtravels-73c62`.
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
Ensure you have `firebase-tools` installed and are logged in.
```bash
firebase deploy
```

## Admin Bootstrap
To make a user an admin:
1. Register normally through the `/signup` page.
2. Go to the Firebase Console -> Firestore.
3. Find the user document in the `users` collection.
4. Change the `role` field from `"user"` to `"admin"`.
5. Refresh the app, and you will have access to `/admin`.

## Removed Services
- Supabase (All components removed)
- Stripe (Disabled/Mocked)
- Redis (Removed)
- Resend (Logging only)
- Husky (Removed)
