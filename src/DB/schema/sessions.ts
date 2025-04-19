import { index, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("userID").references(() => users.userId).notNull(),
    medium: varchar("medium", { length: 15 }).notNull(),
    date: timestamp("date"),
  },
);

export default sessions;