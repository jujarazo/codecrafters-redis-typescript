import { RESP } from "../types.ts";
import { formatIntegerToRESP } from "../helpers.ts";
import * as redisStore from "../store.ts";
import { tryServeBlockedClient } from "../store.ts";

export const handleRpush = (parts: string[]): string => {
  const key = parts[1];
  const valuesToPush = parts.slice(2);
  const existingValue = redisStore.get(key);

  if (!existingValue) {
    redisStore.set(key, {
      type: "list",
      value: [...valuesToPush]
    });

    return formatIntegerToRESP(valuesToPush.length);
  }

  if (existingValue?.type === 'list') {
    if (tryServeBlockedClient(key, valuesToPush[0])) {
      valuesToPush.shift();
    }

    existingValue.value.push(...valuesToPush);
    return formatIntegerToRESP(existingValue.value.length);
  }

  return RESP.WRONG_TYPE;
};
