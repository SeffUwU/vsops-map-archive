import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../entities';

const client = createClient({ url: 'file:data.db' });
export const db = drizzle(client, { schema });
