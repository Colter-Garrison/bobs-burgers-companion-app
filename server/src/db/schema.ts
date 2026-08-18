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
		// onDelete: 'cascade' means Postgres itself deletes a user's
		// favorites automatically when the user row is deleted — no need
		// for our code to manually clean them up first.
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		category: categoryEnum('category').notNull(),
		// This references an id from the external Bob's Burgers API, not a
		// row in our own database — we only store a pointer back to it,
		// never a copy of that content.
		itemId: integer('item_id').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		// Makes "add favorite" idempotent: trying to favorite the same
		// item twice hits this constraint instead of creating a duplicate
		// row, which our route handler turns into a clean 409 response.
		uniqueFavorite: unique('unique_user_category_item').on(
			table.userId,
			table.category,
			table.itemId,
		),
	}),
);

// Drizzle infers these TypeScript types directly from the table
// definitions above, so the shape of a "User" or "Favorite" object in our
// code always matches the real database schema — no separate type
// definitions to keep in sync by hand.
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
