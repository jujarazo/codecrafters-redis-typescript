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
