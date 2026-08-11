import {pgTable, uuid,timestamp, pgEnum} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const requestStateEnum = pgEnum("request_state", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const requestLevelEnum = pgEnum("request_levels", [
  "READ",
  "WRITE",
]);


export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),

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

  level: requestLevelEnum("level")
    .notNull(),
});