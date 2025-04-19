import { pgTable, varchar, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userId: text("userID").primaryKey(),
  name: varchar("name", { length: 35 }).notNull(),
  displayname: varchar("displayname", { length: 35 }).notNull(),
  primary: varchar("primary", { length: 80 }).notNull(),
  continent: varchar("continent", { length: 80 }).notNull(),
});

export default users