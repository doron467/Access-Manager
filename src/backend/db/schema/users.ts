import {pgTable, varchar, uuid, pgEnum, timestamp} from "drizzle-orm/pg-core";

export const roles = [
    "REQUESTER",
    "APPROVER",
    "ADMIN"
] as const;

export type UserRole = (typeof roles)[number];

export const roleEnum = pgEnum('role', roles);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),

    username: varchar('username', {length: 255})
    .notNull()
    .unique(),

    passwordHash: varchar('password_hash', {length: 255})
    .notNull(),

    role: roleEnum('role')
    .notNull()
    .default('REQUESTER'),

    createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});