import { RESP } from "../types.ts";
import * as redisStore from "../store.ts";
import * as net from "node:net";

export function handleBLPop(parts: string[], connection: net.Socket): string | null {
  const key = parts[1];
  const timeout = parseInt(parts[2], 10);

  const entry = redisStore.get(key);

  if (entry?.type === 'list' && entry.value.length > 0) {
    const value = entry.value.shift();
    return `*2\r\n$${key.length}\r\n${key}\r\n$${value?.length}\r\n${value}\r\n`;
  }

  // For timeout 0, we block indefinitely by storing the client
  if (timeout === 0) {
    redisStore.addBlockedClient({ connection, key });
    return null; // No response now
  }

  // In future stages, handle non-zero timeouts
  return RESP.NULL_BULK_STRING;
}
