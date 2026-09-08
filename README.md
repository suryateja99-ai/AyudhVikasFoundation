# Ayudh Vikas Foundation — Healthcare Network App

The public portal, patient, doctor, hospital, marketing, and super-admin screens now persist through a live API. Data is stored in **PostgreSQL** when you provide credentials, and in a local JSON store until then. Socket.IO pushes create/update/delete events so dashboards stay in sync in real time.

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

This starts:

- API + realtime server at `http://localhost:4000`
- Vite app at `http://localhost:3000` (proxies `/api` and `/socket.io`)

## Connect PostgreSQL (credentials later)

The app is ready for PostgreSQL. Until a URL is set it uses `server/local-data.json`.

1. Put credentials in `.env` (copy from `.env.example` if needed):

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/ayudh_vikas
JWT_SECRET=a-long-random-secret
PORT=4000
```

Hosted providers (Neon, Supabase, RDS, Render) use SSL automatically. For local Postgres, no extra SSL flag is needed.

2. Test the connection:

```
npm run db:check
```

3. Restart `npm run dev`. The API creates tables, imports any local JSON data if Postgres is empty (otherwise seeds demo data), and the top bar switches from `Live · local` to `Live DB`.

`GET /api/health` reports `{ postgres, configured, target, error, hint }`.

## Demo logins

| Role | Identifier | Password |
| --- | --- | --- |
| Patient | `9876543210` | `patient123` |
| Doctor | `dr.raviteja@ayudhvikas.org` | `doctor123` |
| Hospital | `kims@ayudhvikas.org` | `hospital123` |
| Marketing | `marketing@ayudhvikasfoundation.org` | `marketing123` |
| Super Admin | `admin@ayudhvikasfoundation.org` | `admin123` |

## What is live

- Login / registration (all roles)
- Doctor appointments
- Ambulance, lab, and home-care bookings
- Hospital visit requests (patient request → hospital accept)
- Health camps + camp registration
- Membership, emergency, callback, and partner forms
- Patient profile, reminders, wallet, tickets, records, feedback
- Hospital doctor roster CRUD
- Marketing leads
- Super-admin add doctor / hospital / camp
- Insurance applications
- Patient ID verification against the registry

## API

- `GET /api/health` — storage mode (`postgres` or `local`) and counts
- `POST /api/auth/login` / `POST /api/auth/register`
- `GET|POST /api/records/:collection`
- `PATCH|DELETE /api/records/:collection/:id`
- Socket event `record:change` `{ collection, action, record }`
