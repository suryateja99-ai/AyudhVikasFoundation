import './load-env.js';
import { createDb, buildMongoUrl } from './db.js';

const url = buildMongoUrl();
if (!url) {
  console.log('MongoDB is not configured yet.');
  console.log('Add this to .env or Render environment variables, then run: npm run db:check');
  console.log('  MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority');
  console.log('Optional:');
  console.log('  MONGODB_DB=ayudh_vikas_db');
  process.exit(2);
}

const db = createDb();
process.env.MONGODB_WATCH = 'false';
const result = await db.connect();
if (result.mode === 'mongodb') {
  const counts = await db.counts();
  console.log('MongoDB connected.');
  console.log('Target:', result.target);
  console.log('Database:', result.database || '(from connection string)');
  console.log('Collections ready. Document counts:', {
    users: counts.users,
    hospitals: counts.hospitals,
    doctors: counts.doctors,
    appointments: counts.appointments,
  });
  await db.close?.();
  process.exit(0);
}

console.error('MongoDB connection failed.');
console.error(result.error || 'Unknown error');
console.error('The app will keep using the local JSON store until this succeeds.');
await db.close?.();
process.exit(1);
