export function formatIntegerToRESP(value: number) {
  return `:${value}\r\n`;
}

export function formatStringToRESP(value: string) {
  return `+${value}\r\n`;
}

export function formatArrayToRESP(items: string[]): string {
  let resp = `*${items.length}\r\n`;
  for (const item of items) {
    resp += `$${item.length}\r\n${item}\r\n`;
  }
  return resp;
}

export function parseEntryId(id: string): [number, number] {
  const [ms, seq] = id.split("-").map(Number);
  return [ms, seq];
}

export function isIdGreater(newId: string, lastId: string): boolean {
  const [newMs, newSeq] = parseEntryId(newId);
  const [lastMs, lastSeq] = parseEntryId(lastId);

  if (newMs > lastMs) return true;
  if (newMs === lastMs) return newSeq > lastSeq;
  return false;
}
