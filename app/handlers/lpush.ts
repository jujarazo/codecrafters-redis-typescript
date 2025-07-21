import { RESP } from "../types.ts";
import {formatIntegerToRESP} from "../helpers.ts";
import * as redisStore from "../store.ts";

export const handleLPush = (parts: string[]): string => {
  const key = parts[1];
  const valuesToPush = parts.slice(2);
  const existingValue = redisStore.get(key);

  const reversed = [...valuesToPush].reverse();

  if (!existingValue) {
    redisStore.set(key, {
      type: "list",
      value: reversed,
    });

    return formatIntegerToRESP(reversed.length);
  }

  if (existingValue?.type === 'list') {
    existingValue.value.unshift(...reversed);
    return formatIntegerToRESP(existingValue.value.length);
  }

  return RESP.WRONG_TYPE;
};
