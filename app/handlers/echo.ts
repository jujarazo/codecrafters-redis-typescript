export function handleEcho(parts: string[]) {
  const message = parts[1] ?? "";
  return `$${message.length}\r\n${message}\r\n`;
}