import {pgTable, uuid,text,varchar} from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 255 })
      .notNull()
      .unique(),

    description: text("description"),
})