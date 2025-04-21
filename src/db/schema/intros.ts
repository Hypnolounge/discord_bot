import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const intros = pgTable("intros", {
  userID: varchar("userID").references(() => users.userId).primaryKey(),
  message: varchar("message").notNull(),
  text: text("text").notNull(),
});

export default intros;