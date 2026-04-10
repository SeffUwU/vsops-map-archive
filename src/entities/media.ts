import { sqliteTable, text, integer, blob, real, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './user.entity';
import { feature } from './feature';

// TODO: this is NOT good. Storing images in DB is not really a "COOL" solution but i wanna minimize my stack..
export const media = sqliteTable(
  'media',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    featureId: text('feature_id').references(() => feature.id, { onDelete: 'cascade' }),
    filename: text('filename'),
    data: blob('data'),
    mimeType: text('mime_type'),
    used: integer('used', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    featureIdIdx: index('media_feature_id_idx').on(table.featureId),
    userIdIdx: index('media_user_id_idx').on(table.userId),
  }),
);

export const mediaRelations = relations(media, ({ one }) => ({
  user: one(users, { fields: [media.userId], references: [users.id] }),
  feature: one(feature, { fields: [media.featureId], references: [feature.id] }),
}));
