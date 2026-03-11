import { createId } from '@paralleldrive/cuid2';
import { boolean, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { bytea } from './custom-types/bytea';
import { schema } from './schema';
import { users } from './user.entity';

// TODO: this is NOT good. Storing images in DB is not really a "COOL" solution but i wanna minimize my stack..
export const media = schema.table('media', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text().references(() => users.id),
  data: bytea('data'),
  mimeType: varchar('mime_type', { length: 50 }),
  used: boolean().default(false), // used for deleting if a use cancelled TODO: add cron for this!!!
  createdAt: timestamp('created_at').defaultNow(),
});
