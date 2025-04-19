import { index, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const compliments = pgTable("compliments",
  {
    id: serial("id").primaryKey(),
    give: varchar("give").references(() => users.userId).notNull(),
    receive: varchar("receive").references(() => users.userId).notNull(),
    comment: text("comment").notNull(),
  },
);

export default compliments;

const infered = compliments["$inferInsert"]