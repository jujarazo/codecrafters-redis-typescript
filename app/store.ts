import type { storedValue } from "./types.ts";

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
