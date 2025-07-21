import * as redisStore from "../store";
import {RESP} from "../types.ts";

export function handleLLen(parts: string[]) {
  const key = parts[1];
  const entry = redisStore.get(key);

  if (!entry) {
    return RESP.EMPTY_ARRAY;
  }

  if (entry.type !== 'list') {
    return RESP.WRONG_TYPE
  }

  return `:${entry.value.length}\r\n`;
}