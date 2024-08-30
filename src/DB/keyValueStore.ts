import db from "./index";

export async function getKeyValue(key: string) {
  const data = await db.key_value.findFirst({ where: { key:key } });
  return data?.value || "";
}

export async function setKeyValue(key: string, value: string) {
  await db.key_value.upsert({
    where: { key: key },
    update: { value: value },
    create: { key: key, value: value },
  });
}