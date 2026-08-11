import {pgTable, varchar, uuid, pgEnum} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', [
    'REQUESTER', 
    'APPROVER', 
    'ADMIN'
]);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', {length: 255}).notNull().unique(),
    passwordHash: varchar('password_hash', {length: 255}).notNull(),
    role: roleEnum('role').notNull().default('REQUESTER')
});