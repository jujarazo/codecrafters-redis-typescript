import {parseSetOptions} from "../parser";
import * as redisStore from "../store.ts"

export function handleSet(commandParts: string[]) {
  const key = commandParts[1];
  const value = commandParts[2];

  const {expiresAt} = parseSetOptions(commandParts.slice(3))

  redisStore.set(key, {type: 'string', value, expiresAt});
}