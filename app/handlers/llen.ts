import * as redisStore from "../store";
import {RESP} from "../types.ts";

export function handleLLen(parts: string[]) {
  const key = parts[0];
  const entry = redisStore.get(key);

  if (!entry || entry.type !== 'list') {
    return RESP.EMPTY_ARRAY;
  }

  return `:${entry.value.length}\r\n`;
}