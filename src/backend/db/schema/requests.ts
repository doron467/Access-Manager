import {pgTable, uuid,timestamp, pgEnum, varchar} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import {applications} from "./applications.js"

export const requestStates = [
    "PENDING",
    "APPROVED",
    "REJECTED"
] as const;

export type RequestState = (typeof requestStates)[number];
export const requestStateEnum = pgEnum("request_state", requestStates);


export const requestLevels = [
  "READ",
  "WRITE"
] as const;

export type RequestLevel = (typeof requestLevels)[number];
export const requestLevelEnum = pgEnum("request_levels", requestLevels);


export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),

  appId: uuid("app_id")
    .notNull()
    .references(() => applications.id),

  level: requestLevelEnum("level")
    .notNull(),

  reason: varchar("reason", { length: 500 })
    .notNull(),

  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  decisionBy: uuid("decision_by")
    .references(() => users.id),

  decisionAt: timestamp("decision_at", { withTimezone: true }),

  state: requestStateEnum("state")
    .notNull()
    .default("PENDING"),

});