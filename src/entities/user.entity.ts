import { createId } from '@paralleldrive/cuid2';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { feature } from './feature';
import { AllowedLocale } from '@/types/enums/allowed-locale.enum';

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  login: text('login').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  locale: text('locale').default('en'),
  uiLocale: text('ui_locale').default('en'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToFeatures: many(feature),
}));

export type IUser = Omit<typeof users.$inferSelect, 'uiLocale'> & { uiLocale: AllowedLocale };
