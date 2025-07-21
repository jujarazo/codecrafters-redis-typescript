import { RESP } from "../types.ts";
import { formatIntegerToRESP } from "../helpers.ts";
import * as redisStore from "../store.ts";
import { tryServeBlockedClient } from "../store.ts";

export const handleRpush = (parts: string[]): string => {
  const key = parts[1];
  const valuesToPush = parts.slice(2);

  let numPushed = 0;

  if (tryServeBlockedClient(key, valuesToPush[0])) {
    valuesToPush.shift();
    numPushed += 1;
  }

  const existingValue = redisStore.get(key);

  if (!existingValue) {
    redisStore.set(key, {
      type: "list",
      value: [...valuesToPush],
    });
    numPushed += valuesToPush.length;
    return formatIntegerToRESP(numPushed);
  }

  if (existingValue.type === "list") {
    existingValue.value.push(...valuesToPush);
    numPushed += valuesToPush.length;
    return formatIntegerToRESP(existingValue.value.length);
  }

  return RESP.WRONG_TYPE;
};

