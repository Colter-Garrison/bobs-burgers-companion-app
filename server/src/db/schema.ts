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

export const tokenPurposeEnum = pgEnum('token_purpose', [
	'email_verification',
	'password_reset',
]);


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
	email: varchar('email', { length: 255 }).unique(),
	emailVerifiedAt: timestamp('email_verified_at'),
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

export const authTokens = pgTable('auth_tokens', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	purpose: tokenPurposeEnum('purpose').notNull(),
	token: varchar('token', { length: 64 }).notNull().unique(),
	expiresAt: timestamp('expires_at').notNull(),
	usedAt: timestamp('used_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;
