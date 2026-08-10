import {pgTable, text, serial, varchar} from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', {length: 255}).notNull().unique(),
    passwordHash: varchar('password_hash', {length: 255}).notNull(),
});