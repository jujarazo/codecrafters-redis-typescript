import * as redisStore from '../store';
import {RESP} from "../types.ts";
import {formatStringToRESP} from "../helpers.ts";

export function handleType(parts: string[]) {
  const key = parts[1];
  const value = redisStore.get(key);

  if (!value) return RESP.NONE;

  return formatStringToRESP(value.type);
}