import { RESP } from "../types.ts";
import * as redisStore from "../store.ts";
import { formatArrayToRESP } from "../helpers.ts";

export function handleLPop(parts: string[]): string {
  const key = parts[1];
  const entry = redisStore.get(key);

  if (!entry || entry.type !== "list") {
    return RESP.NULL_BULK_STRING;
  }

  const list = entry.value;

  // Single element (default LPOP behavior)
  if (parts.length === 2) {
    const value = list.shift();
    return value !== undefined
      ? `$${value.length}\r\n${value}\r\n`
      : RESP.NULL_BULK_STRING;
  }

  // Multiple element pop (LPOP key count)
  const count = parseInt(parts[2], 10);

  if (isNaN(count) || count <= 0) {
    return RESP.EMPTY_ARRAY;
  }

  const popped: string[] = [];

  for (let i = 0; i < count && list.length > 0; i++) {
    const val = list.shift();
    if (val !== undefined) {
      popped.push(val);
    }
  }

  return formatArrayToRESP(popped);
}
