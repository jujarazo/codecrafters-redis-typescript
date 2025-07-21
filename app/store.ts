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
  timeoutId?: Timer;
  key: string;
};

const blockedClients = new Map<string, BlockedClient[]>();


export function addBlockedClient(client: BlockedClient) {
  const { key } = client;

  if (!blockedClients.has(key)) {
    blockedClients.set(key, []);
  }

  blockedClients.get(key)!.push(client);
}


export function tryServeBlockedClient(key: string, value: string): boolean {
  const queue = blockedClients.get(key);
  if (!queue || queue.length === 0) return false;

  const client = queue.shift()!;
  if (queue.length === 0) {
    blockedClients.delete(key);
  }

  if (client.timeoutId) {
    clearTimeout(client.timeoutId);
  }

  const response = `*2\r\n$${key.length}\r\n${key}\r\n$${value.length}\r\n${value}\r\n`;
  client.connection.write(response);

  return true;
}


export function clearBlockedClientsForKey(key: string) {
  const clients = blockedClients.get(key);
  if (!clients) return;

  for (const client of clients) {
    if (client.timeoutId) clearTimeout(client.timeoutId);
  }

  blockedClients.delete(key);
}

export function removeBlockedClient(connection: net.Socket, key: string) {
  const queue = blockedClients.get(key);
  if (!queue) return;

  const updated = queue.filter(c => c.connection !== connection);
  if (updated.length === 0) {
    blockedClients.delete(key);
  } else {
    blockedClients.set(key, updated);
  }
}


