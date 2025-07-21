import { RESP } from "../types.ts";
import {formatIntegerToRESP} from "../helpers.ts";
import * as redisStore from "../store.ts";

export const handleLPush = (parts: string[]): string => {
  const key = parts[1];
  const valuesToPush = parts.slice(2);
  const existingValue = redisStore.get(key);

  if (!existingValue) {
    redisStore.set(key, {
      type: "list",
      value: [...valuesToPush.reverse()]
    });

    return formatIntegerToRESP(valuesToPush.length);
  }

  if (existingValue?.type === 'list') {
    existingValue.value.push(...valuesToPush.reverse());
    return formatIntegerToRESP(existingValue.value.length);
  }

  return RESP.WRONG_TYPE;
};
