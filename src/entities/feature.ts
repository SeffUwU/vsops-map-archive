import { schema } from '@/entities/schema';
import { relations } from 'drizzle-orm';
import { index, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './user.entity';
import { createId } from '@paralleldrive/cuid2';

export const feature = schema.table(
  'features',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    creatorId: text('creator_id').references(() => users.id, { onDelete: 'set null' }),
    geometry: jsonb('geometry').notNull(),
    properties: jsonb('properties').default({}).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index('features_id_pkey').on(t.id), index('creator_id_fk').on(t.id)],
);

export const campaignFeaturesRelations = relations(feature, ({ one }) => ({
  creator: one(users, { fields: [feature.creatorId], references: [users.id] }),
}));

export type ICampaignFeature = typeof feature.$inferSelect;
export type INewCampaignFeature = typeof feature.$inferInsert;
