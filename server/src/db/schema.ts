import {
	pgTable,
	pgEnum,
	serial,
	varchar,
	text,
	integer,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core';

// A Postgres enum, not just a TypeScript union type — this means the
// database itself rejects an invalid category value, not just our
// application code. Defense in depth: even if a bug slipped bad data past
// our request validation, the database still refuses to store it.
export const categoryEnum = pgEnum('category', [
	'burger',
	'character',
	'end_credit',
	'episode',
	'pest_control_truck',
	'store',
]);

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: varchar('username', { length: 25 }).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const favorites = pgTable(
	'favorites',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		category: categoryEnum('category').notNull(),
		itemId: integer('item_id').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		uniqueFavorite: unique('unique_user_category_item').on(
			table.userId,
			table.category,
			table.itemId,
		),
	}),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
