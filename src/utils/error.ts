export function log_error(message: string) {
  const current = getCurrentFormattedTime();
  console.error(current + message);
}

export function log_info(message: string) {
  const current = getCurrentFormattedTime();
  console.info(current + message);
}

function getCurrentFormattedTime(): string {
  const now = new Date();

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  return `[${day}.${month}|${hours}:${minutes}:${seconds}] `;
}
