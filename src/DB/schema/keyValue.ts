import { pgTable, varchar } from "drizzle-orm/pg-core";

export const keyValue = pgTable("key_value", {
    key: varchar("key").primaryKey(),
    value: varchar("value"),
});

export default keyValue;