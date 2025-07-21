import { RESP } from "../types.ts";
import * as redisStore from "../store.ts";
import * as net from "node:net";

export function handleBLPop(parts: string[], connection: net.Socket): string | null {
  const key = parts[1];
  const timeoutSeconds = parseFloat(parts[2]);

  const entry = redisStore.get(key);

  if (entry?.type === "list" && entry.value.length > 0) {
    const value = entry.value.shift();
    return `*2\r\n$${key.length}\r\n${key}\r\n$${value?.length}\r\n${value}\r\n`;
  }

  const timeoutId =
    timeoutSeconds > 0
      ? setTimeout(() => {
        connection.write(RESP.NULL_BULK_STRING);
        redisStore.removeBlockedClient(connection, key);
      }, timeoutSeconds * 1000)
      : undefined;

  redisStore.addBlockedClient({ connection, key, timeoutId });

  return null;
}
