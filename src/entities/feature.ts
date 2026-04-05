import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './user.entity';
import { media } from './media';
import { VSMap } from '@/types/map/vsmap';

export const feature = sqliteTable(
  'features',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    creatorId: text('creator_id').references(() => users.id, { onDelete: 'set null' }),
    geometry: text('geometry', { mode: 'json' }).notNull(),
    properties: text('properties', { mode: 'json' }).$type<VSMap.FeatureProperties>().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    creatorIdIdx: index('features_creator_id_idx').on(table.creatorId),
  }),
);

export const campaignFeaturesRelations = relations(feature, ({ one, many }) => ({
  creator: one(users, { fields: [feature.creatorId], references: [users.id] }),
  mediaItems: many(media),
}));

export type ICampaignFeature = typeof feature.$inferSelect;
export type INewCampaignFeature = typeof feature.$inferInsert;
