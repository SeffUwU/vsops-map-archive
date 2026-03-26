import { sql } from 'drizzle-orm';
import { db } from '@/server/database';
const VACUUM_DEBOUNCE = 60_000; // 1 minute

let vacuumTimeout: NodeJS.Timeout | null = null;

export const debouncedVacuum = () => {
  if (vacuumTimeout) {
    clearTimeout(vacuumTimeout);
  }

  console.log('VACUUM debounced');

  vacuumTimeout = setTimeout(async () => {
    console.log('VACUUM starting...');
    try {
      await db.run(sql`VACUUM`);
      console.log('VACUUM success.');
    } catch (e) {
      console.error('VACUUM failed:', e);
    } finally {
      vacuumTimeout = null;
    }
  }, VACUUM_DEBOUNCE);
};
