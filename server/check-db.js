import './load-env.js';
import { createDb, buildDatabaseUrl } from './db.js';

const url = buildDatabaseUrl();
if (!url) {
  console.log('PostgreSQL is not configured yet.');
  console.log('Add one of these to .env, then run: npm run db:check');
  console.log('  DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE');
  console.log('or');
  console.log('  PGHOST=...');
  console.log('  PGPORT=5432');
  console.log('  PGUSER=...');
  console.log('  PGPASSWORD=...');
  console.log('  PGDATABASE=ayudh_vikas');
  process.exit(2);
}

const db = createDb();
const result = await db.connect();
if (result.mode === 'postgres') {
  const counts = await db.counts();
  console.log('PostgreSQL connected.');
  console.log('Target:', result.target);
  console.log('Tables ready. Row counts:', {
    users: counts.users,
    hospitals: counts.hospitals,
    doctors: counts.doctors,
    appointments: counts.appointments,
  });
  process.exit(0);
}

console.error('PostgreSQL connection failed.');
console.error(result.error || 'Unknown error');
console.error('The app will keep using the local JSON store until this succeeds.');
process.exit(1);
