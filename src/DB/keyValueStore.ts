import db from "./index";

export async function getKeyValue(lookupKey: string, type: string = "default") {
  const query = `${lookupKey}_${type}`;
  const data = await db.key_value.findFirst({ where: { key: query } });
  return data?.value || "";
}

export async function setKeyValue(
  lookupKey: string,
  value: string,
  type: string = "default"
) {
  const query = `${lookupKey}_${type}`;
  try {
    await db.key_value.upsert({
      where: { key: query },
      update: { value: value },
      create: { key: query, value: value },
    });
    return true;
  } catch (e) {
    console.error(e);
    throw new Error(`Error setting key value pair for ${query}`);
  }
}