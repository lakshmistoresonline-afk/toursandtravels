# Ambady Tours and Travels — Firebase Migration & Production Guide

This document summarizes the complete migration of the Ambady Tours and Travels Tour Management System from a
complex multi-provider architecture to a streamlined, **Firebase-only** platform.

## 🏗️ Architecture Overview

The system now runs entirely on the **Firebase Spark (Free) Plan**:

- **Hosting**: Firebase Hosting (Static SPA mode).
- **Authentication**: Firebase Auth (Email/Password).
- **Database**: Cloud Firestore (Real-time NoSQL).
- **Storage**: Firebase Storage (Tour images and profiles).
- **Frontend**: React Router v7 (Framework Mode) unified application.

## 🔐 Authentication & Access Control

### One Login Architecture

There is exactly **one login screen** at `/login`. The system automatically routes users based on their role
stored in Firestore:

- **`role: "user"`** → Redirected to the customer dashboard and tour booking.
- **`role: "admin"`** → Redirected to the administrative management panel.

### Test Accounts

| Account Type      | Email                                | Password      | Role      |
| :---------------- | :----------------------------------- | :------------ | :-------- |
| **Administrator** | `admin@Ambady Tours and Travels.com` | `Password123` | **admin** |
| **Test User 1**   | `user1@example.com`                  | `Password123` | user      |
| **Test User 2**   | `user2@example.com`                  | `Password123` | user      |

## 🛠️ Deployment Instructions

### 1. Prerequisites

Ensure you have the Firebase CLI installed:

```bash
npm install -g firebase-tools
```

### 2. Environment Setup

Verify your `.env` file contains the following (already configured in this repository):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 3. Deploy to Live Site

Run the following command from the project root:

```bash
firebase deploy
```

**Live URL:** [https://toursandtravels-73c62.web.app](https://toursandtravels-73c62.web.app)

## 📁 Project Structure (Unified)

We have merged the `admin` and `front-panel` into a single high-performance application:

- `front-panel/`: Contains the unified React Router application.
    - `app/routes/`: Main website routes.
    - `app/routes/admin/`: Administrative dashboard routes.
- `shared/`: Contains logic shared across any potential future micro-services.

## 🧹 Cleanup Summary

The following third-party dependencies have been **completely removed** to ensure zero operating costs:

- **Supabase**: Replaced by Firestore/Auth.
- **Stripe**: Payments disabled (Simple mode).
- **Redis**: Caching removed (Spark-friendly Firestore reads used).
- **Resend**: Replaced by console logging for emails.
- **reCAPTCHA**: Replaced by mock validation.
- **Husky**: Removed to fix Vercel/CI installation errors.

## 🚀 Future Maintenance

To add new features or modify the site:

1. Run `npm run dev` to start the local development server.
2. Make your changes in `front-panel/app`.
3. Run `npm run build` to verify the production build.
4. Run `firebase deploy` to push changes to the live site.

---

_Created on: 2026-09-09_
