import type { storedValue } from "./types.ts";
import * as net from "node:net";

const store = new Map<string, storedValue>();

export function get(key: string) {
  return store.get(key);
}

export function set(key: string, value: storedValue) {
  store.set(key, value);
}

export function del(key: string) {
  store.delete(key);
}

type BlockedClient = {
  connection: net.Socket;
  key: string;
};

const blockedClients: BlockedClient[] = [];

export function addBlockedClient(client: BlockedClient) {
  blockedClients.push(client);
}

export function tryServeBlockedClient(key: string, value: string): boolean {
  const index = blockedClients.findIndex(c => c.key === key);
  if (index === -1) return false;

  const client = blockedClients.splice(index, 1)[0];
  const response = `*2\r\n$${key.length}\r\n${key}\r\n$${value.length}\r\n${value}\r\n`;
  client.connection.write(response);
  return true;
}
