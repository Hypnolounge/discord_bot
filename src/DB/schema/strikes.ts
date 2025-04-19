import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const strikes = pgTable("strikes",
  {
    id: serial("id").primaryKey(),
    userID: varchar("userID").references(() => users.userId).notNull(),
    reason: text("reason").notNull(),
  },
);

export default strikes;