import { RESP } from "../types.ts";
import * as redisStore from "../store.ts";

export function handleLPop(parts: string[]): string {
  const key = parts[1];
  const entry = redisStore.get(key);

  if (!entry || entry.type !== "list") {
    return RESP.NULL_BULK_STRING;
  }

  const value = entry.value.shift();

  if (value === undefined) {
    return RESP.NULL_BULK_STRING;
  }

  return `$${value.length}\r\n${value}\r\n`;
}
