import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './user.entity';

export const settlement = sqliteTable(
  'settlements',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text('name').notNull(),
    description: text('description').notNull(),
    leader: text('leader').notNull(),
    members: text('members', { mode: 'json' }).$type<string[]>().notNull(),
    creatorId: text('creator_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    location: text('location', { mode: 'json' }).$type<[number, number]>().notNull(),
  },
  (table) => ({
    creatorIdIdx: index('settlements_creator_id_idx').on(table.creatorId),
  }),
);

export const settlementRelations = relations(settlement, ({ one }) => ({
  creator: one(users, { fields: [settlement.creatorId], references: [users.id] }),
}));

export type ISettlement = typeof settlement.$inferSelect;
export type INewSettlement = typeof settlement.$inferInsert;
