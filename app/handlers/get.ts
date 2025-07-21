import { RESP } from "../types.ts";
import * as redisStore from "../store.ts";

export const handleGet = (parts: string[]): string => {
  const key = parts[1];
  const entry = redisStore.get(key);

  if (!entry || entry.type !== "string") return RESP.NULL_BULK_STRING;

  const { value, expiresAt } = entry;

  if (expiresAt && Date.now() >= expiresAt) {
    redisStore.del(key);
    return RESP.NULL_BULK_STRING;
  }

  return `$${value.length}\r\n${value}\r\n`;
};
