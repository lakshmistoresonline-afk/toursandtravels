# Ambady Tours and Travels — Local Development Guide

Follow these steps to set up and run the Ambady Tours and Travels Tour Management System on your local
machine.

## 1. Prerequisites

- **Node.js**: Version 20 or higher recommended.
- **npm**: Version 10 or higher.
- **Firebase**: You should have a Firebase project set up (the code is pre-configured for
  `toursandtravels-73c62`).

## 2. Initial Setup

First, ensure your environment variables are configured.

1. Check that the `.env` file exists in the root directory.
2. If not, copy it from the example:
    ```bash
    cp .env.example .env
    ```
    _(Note: I have already pre-filled the .env file with your project keys in this repository)._

## 3. Install Dependencies

Install all required packages for the workspace:

```bash
npm install
```

## 4. Build Shared Services

The project uses a `shared` workspace for database logic. You must build this first:

```bash
npm run build:shared
```

## 5. Start Development Server

Run the unified application (includes both User and Admin interfaces):

```bash
npm run dev
```

By default, the app will be available at: **`http://localhost:5175`** (check terminal output for exact port).

### 💡 Troubleshooting Tip:

If you see a **"504 Outdated Optimize Dep"** error in the browser console, restart the server using the force
flag to clear the cache:

```bash
npm run dev -- --force
```

## 6. Accessing Different Roles

The system uses a **Single Login** at `/login`.

- **To test as a Customer**:
    - Login with `test1@ambady.com` (Password: `Password123`).
    - You will be able to browse tours and join them.
- **To test as an Admin**:
    - Login with `admin@ambady.com` (Password: `Password123`).
    - You will be redirected to the **Admin Dashboard**.
    - You can also manually go to `/admin` once logged in.

## 7. Key Commands

| Command           | Description                              |
| :---------------- | :--------------------------------------- |
| `npm run dev`     | Start local dev server                   |
| `npm run build`   | Create a clean production build          |
| `npm run format`  | Fix code formatting with Prettier        |
| `firebase deploy` | Deploy the latest build to the live site |

---

_For more details on the architecture, see `FIREBASE_MIGRATION_GUIDE.md`._
