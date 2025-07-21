import * as redisStore from "../store";
import {RESP} from "../types.ts";
import {formatIntegerToRESP} from "../helpers.ts";

export function handleLLen(parts: string[]) {
  const key = parts[1];
  const entry = redisStore.get(key);

  if (!entry) {
    return formatIntegerToRESP(0);
  }

  if (entry.type !== 'list') {
    return RESP.WRONG_TYPE
  }

  return formatIntegerToRESP(entry.value.length);
}