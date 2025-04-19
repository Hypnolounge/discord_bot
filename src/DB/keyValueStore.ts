import db from "./index";
import keyValue from "./schema/keyValue";
import { eq } from "drizzle-orm";

export async function getKeyValue(lookupKey: string, type: string = "default") {
  const query = `${lookupKey}_${type}`;
  const data = (
    await db.select().from(keyValue).where(eq(keyValue.key, query))
  )[0];
  return data?.value || "";
}

export async function setKeyValue(
  lookupKey: string,
  value: string,
  type: string = "default"
) {
  const query = `${lookupKey}_${type}`;
  try {
    return await db
      .insert(keyValue)
      .values({
        key: query,
        value: value,
      })
      .onConflictDoUpdate({
        target: keyValue.key,
        set: {
          value: value,
        },
      });
  } catch (e) {
    console.error(e);
    throw new Error(`Error setting key value pair for ${query}`);
  }
}
