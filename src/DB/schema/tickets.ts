import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

const ticketTemplate = {
  id: serial("id").primaryKey(),
  userId: varchar("userID")
    .references(() => users.userId)
    .notNull(),
  channel: varchar("channel"),
  opened: timestamp("opened").notNull().defaultNow(),
  closed: timestamp("closed"),
  reason: varchar("reason", { length: 20 }),
};

export const ticketsApplication = pgTable(
  "tickets_application",
  ticketTemplate
);

export const ticketsIssue = pgTable("tickets_issue", ticketTemplate);

export const ticketsMisc = pgTable("tickets_misc", ticketTemplate);
