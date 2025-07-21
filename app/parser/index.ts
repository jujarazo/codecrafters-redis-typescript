import {SET_COMMANDS} from "../types.ts";

export function parseRESP(buffer: Buffer ): string[] {
  const bufferParsed = buffer.toString();
  const lines = bufferParsed.split("\r\n");

  if (!lines.length && !lines[0].startsWith("*")) {
    throw new Error("Expecting lines without starting line, or RESP array");
  }

  const res: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("$")) {
      const len = parseInt(line.slice(1), 10);
      const value = lines[i + 1];
      res.push(len === -1 ? null as unknown as string : value);
      i++;
    }
  }

  return res;
}

export function parseSetOptions(args: string[]): { expiresAt?: number } {
  let expiresAt: number | undefined = undefined;

  for (let i = 0; i < args.length - 1; i++) {
    const option = args[i].toUpperCase();

    if (option === SET_COMMANDS.PX) {
      const ttl = parseInt(args[i + 1], 10);
      if (!isNaN(ttl)) {
        expiresAt = Date.now() + ttl;
      }
      i++;
    }
  }

  return { expiresAt };
}