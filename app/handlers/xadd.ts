import { RESP } from "../types.ts";
import * as redisStore from "../store.ts";
import {isIdGreater, parseEntryId} from "../helpers.ts";

export function handleXAdd(parts: string[]): string {
  const key = parts[1];
  const id = parts[2];

  if (!/^\d+-\d+$/.test(id)) {
    return RESP.ERROR_PARSE;
  }

  const [ms, seq] = parseEntryId(id);
  if (ms === 0 && seq === 0) {
    return RESP.ID_IS_CERO;
  }

  const fields: Record<string, string> = {};
  for (let i = 3; i < parts.length; i += 2) {
    const field = parts[i];
    const value = parts[i + 1];
    if (!value) return RESP.ERROR_PARSE;
    fields[field] = value;
  }

  const existing = redisStore.get(key);

  if (!existing) {
    redisStore.set(key, {
      type: "stream",
      value: [{ id, fields }],
    });
  } else if (existing.type === "stream") {
    const lastEntry = existing.value[existing.value.length - 1];

    if (!isIdGreater(id, lastEntry.id)) {
      return RESP.ID_IS_EQUAL_SMALLER;
    }

    existing.value.push({ id, fields });
  } else {
    return RESP.WRONG_TYPE;
  }

  return `$${id.length}\r\n${id}\r\n`;
}
