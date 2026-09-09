# Ayudh Vikas Foundation - Healthcare Network App

The public portal, patient, doctor, hospital, marketing, and super-admin screens persist through a live Express API. Data is stored in **MongoDB** when `MONGODB_URI` is configured, and in `server/local-data.json` as a local fallback.

## Run Locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

This starts:

- API + realtime event stream at `http://localhost:4000`
- Vite app at `http://localhost:3000` with `/api` proxied to the backend

## Connect MongoDB

1. Put credentials in `.env` or `.env.local`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/ayudh_vikas_db?retryWrites=true&w=majority
MONGODB_DB=ayudh_vikas_db
JWT_SECRET=a-long-random-secret
PORT=4000
```

2. Test the connection:

```bash
npm run db:check
```

3. Restart `npm run dev`.

The API creates MongoDB collections/indexes, imports existing local JSON data if MongoDB is empty, and seeds initial data when needed. The top bar switches from `Live - local` to `Live MongoDB`.

`GET /api/health` reports `{ mongodb, configured, target, database, error, hint }`.

## Render Deployment

Use a single Render Web Service for frontend + backend:

```bash
npm install && npm run build
```

Start command:

```bash
node server/index.js
```

Set these Render environment variables:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/ayudh_vikas_db?retryWrites=true&w=majority
MONGODB_DB=ayudh_vikas_db
JWT_SECRET=a-long-random-secret
NODE_ENV=production
```

## Demo Logins

| Role | Identifier | Password |
| --- | --- | --- |
| Patient | `9876543210` | `patient123` |
| Doctor | `dr.raviteja@ayudhvikas.org` | `doctor123` |
| Hospital | `kims@ayudhvikas.org` | `hospital123` |
| Marketing | `marketing@ayudhvikasfoundation.org` | `marketing123` |
| Super Admin | `admin@ayudhvikasfoundation.org` | `admin123` |

## What Is Live

- Login / registration for all roles
- Doctor appointments
- Ambulance, lab, and home-care bookings
- Hospital visit requests
- Health camps + camp registration
- Membership, emergency, callback, and partner forms
- Patient profile, reminders, wallet, tickets, records, feedback
- Hospital doctor roster CRUD
- Marketing leads
- Super-admin role management
- Insurance applications
- Patient ID verification against the registry

## API

- `GET /api/health` - storage mode (`mongodb` or `local`) and counts
- `POST /api/auth/login` / `POST /api/auth/register`
- `GET|POST /api/records/:collection`
- `PATCH|DELETE /api/records/:collection/:id`
- Event stream: `GET /api/stream`
