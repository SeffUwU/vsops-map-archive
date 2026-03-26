import { sqliteTable, text, integer, blob, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './user.entity';

// TODO: this is NOT good. Storing images in DB is not really a "COOL" solution but i wanna minimize my stack..
export const media = sqliteTable('media', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id),
  data: blob('data'),
  mimeType: text('mime_type'),
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
