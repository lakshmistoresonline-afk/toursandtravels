# WanderNest - Simple Tour Management System

> Focused, Fast, and Free-tier compatible Tour Management System.

---

## Central Business Model
**ONE CUSTOMER PROFILE → MANY FUTURE TOUR REGISTRATIONS**

Customers register once, and their details are automatically reused for all future tour registrations. Admin manages tours, itineraries, and participants with profile snapshots for historical integrity.

---

## Features

### <u>Customer Application</u>
- **Once-off Registration**: Complete profile with personal, contact, and address details.
- **Tour Discovery**: Browse upcoming tours and itineraries.
- **Quick Registration**: "Join Tour" with a single click, reusing saved profile data.
- **Tour History**: View upcoming and completed journeys.

### <u>Admin Panel</u>
- **Tour CRUD**: Manage tours with day-by-day itineraries.
- **Registration Management**: View participants with their profile snapshots at the time of registration.
- **Dashboard**: Simple metrics for customers, tours, and registrations.

---

## Tech Stack (Free Tier Optimized)
- **Frontend**: React 19, React Router v7.
- **Backend**: Supabase (Auth, PostgreSQL, Storage).
- **Styling**: Tailwind CSS, Shadcn UI.
- **Dependencies**: Simplified to remove mandatory Stripe, Redis, and Resend.

---

## Environment Variables
Create a `.env` file from `.env.sample`:
```dotenv
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Local Development
1. `npm install`
2. `npm run dev`

## Build & Deployment
Build everything from repo root using npm:

```bash
npm run build:shared
npm run build:admin
npm run build:front
# or
npm run build:all
```

Or use docker <b>(RUN FROM REPO ROOT)</b>
```bash
export $(cat .env | xargs)

docker build -f front-panel/Dockerfile \
    $(for var in $(cat .env | cut -d= -f1); do echo "--build-arg $var=${!var}"; done) \
    -t rr-tours-app .

docker run --env-file .env -p 3000:3000 front-panel
```

## Deploying on Render

The simplest and most reliable way to host both apps in a monorepo is to create **two separate Render services** — one for each app.

### Service 1 — front-panel

- **Name:** `front-panel` (or similar)
- **Environment:** Docker
- **Dockerfile Path:** front-panel/Dockerfile
- **Environment Variables:** Add these from `.env`
- **Secret Variable File:** Add `.env` file and its content

### Service 2 — admin-panel

- **Name:** `admin-panel` (or similar)
- **Environment:** Docker
- **Dockerfile Path:** admin-panel/Dockerfile
- **Environment Variables:** Add these from `.env`
- **Secret Variable File:** Add `.env` file and its content

### Important Render Notes

- **Two services is strongly recommended** for monorepos  
    (One service per app → each points to its own subdirectory)

- **Security rule**  
  Environment variables that are not prefixed by VITE_ must **never** be sent to the browser.

## Deploying on Vercel

Vercel handles monorepos and React Router well, but the cleanest split is usually:

### Recommended: front-panel → Vercel   +   admin → Render

#### front-panel on Vercel

1. New Vercel project → Import repo
2. **Root Directory:** `/front-panel`
3. **Build Command** (optional — Vercel often auto-detects):
   ```bash
   npm run build -w front-panel
   ```
4. **Output Directory:** usually auto-detected (`./front-panel/build`)
5. **Environment Variables** (in Vercel dashboard):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - all other variables

#### admin → keep on Render

Use the Render setup shown above — this keeps your service role key 100% server-side.

### Alternative: Both on Vercel

- **Two separate projects** (easiest):
    - Project 1 → Root: `/front-panel`
    - Project 2 → Root: `/admin`

- **Single project + rewrites** → requires `vercel.json` configuration

<u><i>Developed by Talha — open an issue or contact at muhammadtalha13457@gmail.com.<i><u>