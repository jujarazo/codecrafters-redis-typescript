import {RESP} from "../types.ts";
import {formatArrayToRESP} from "../helpers.ts";
import * as redisStore from "../store.ts";

export function handleLRange(parts: string[]) {
  const key = parts[1];
  let startIndex = parseInt(parts[2], 10);
  let endIndex = parseInt(parts[3],10);

  if (isNaN(startIndex) || isNaN(endIndex)) {
    return RESP.ERROR_PARSE;
  }

  const entry = redisStore.get(key);
  const listLength = entry?.value.length || 0;
  if (startIndex < 0) startIndex = listLength + startIndex;
  if (endIndex < 0) endIndex = listLength + endIndex;

  // Clamp the indexes in case it is still negative
  startIndex = Math.max(0, startIndex);
  endIndex = Math.min(endIndex, listLength - 1);

  if (startIndex >= listLength || startIndex > endIndex || entry?.type !== 'list') {
    return "*0\r\n";
  }

  const end = Math.min(endIndex, listLength - 1);
  const result = entry?.value.slice(startIndex, end + 1);

  return formatArrayToRESP(result);
}