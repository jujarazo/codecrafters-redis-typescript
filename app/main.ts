import * as net from "net";
import {COMMANDS, RESP, SET_COMMANDS, type storedValue} from "./types.ts";
import {formatArrayToRESP, formatIntegerToRESP} from "./helpers.ts";

console.log("Logs from your program will appear here!");

const store = new Map<string, storedValue>();

function parseRESP(buffer: Buffer ): string[] {
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

function parseSetOptions(args: string[]): { expiresAt?: number } {
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

const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection
  connection.on("data", (chunk) => {
    console.log("Received data: ", chunk.toLocaleString());

    try {
      const commandParts = parseRESP(chunk);
      const command = commandParts[0].toUpperCase();

      switch (command) {
        case COMMANDS.PING:
          connection.write(RESP.PONG);
          break;

        case COMMANDS.ECHO: {
          const message = commandParts[1] ?? "";
          connection.write(`$${message.length}\r\n${message}\r\n`);
          break;
        }

        case COMMANDS.SET: {
          const key = commandParts[1];
          const value = commandParts[2];

          const {expiresAt} = parseSetOptions(commandParts.slice(3))

          store.set(key, {type: 'string', value, expiresAt});
          connection.write(RESP.OK);
          break;
        }

        case COMMANDS.GET: {
          const key = commandParts[1];
          const storedValue = store.get(key);

          if(!storedValue) {
            connection.write(RESP.NULL_BULK_STRING);
            break;
          }

          const { value, expiresAt } = storedValue;

          if (expiresAt && Date.now() >= expiresAt) {
            store.delete(key);
            connection.write(RESP.NULL_BULK_STRING);
          } else {
            connection.write(`$${value.length}\r\n${value}\r\n`);
          }
          break;
        }

        case COMMANDS.RPUSH: {
          const key = commandParts[1];
          const valuesToPush = commandParts.slice(2);
          const existingValue = store.get(key);

          if (!existingValue) {
            store.set(key, {
              type: "list",
              value: [...valuesToPush]
            });

            connection.write(formatIntegerToRESP(valuesToPush.length));
          } else if (existingValue?.type === 'list') {
            existingValue.value.push(...valuesToPush);
            connection.write(formatIntegerToRESP(existingValue.value.length));
          } else {
            connection.write(RESP.WRONG_TYPE);
          }

          break;
        }

        case COMMANDS.LRANGE: {
          const key = commandParts[1];
          const startIndex = parseInt(commandParts[2], 10);
          const endIndex = parseInt(commandParts[3],10);

          if (isNaN(startIndex) || isNaN(endIndex) || startIndex < 0 || endIndex < 0) {
            connection.write(RESP.ERROR_PARSE);
            break;
          }

          const entry = store.get(key);
          const listLength = entry?.value.length || 0;

          if (startIndex >= listLength || startIndex > endIndex || entry?.type !== 'list') {
            connection.write("*0\r\n");
            break;
          }
          const end = Math.min(endIndex, listLength - 1);
          const result = entry?.value.slice(startIndex, end + 1);

          connection.write(formatArrayToRESP(result));

          break;
        }

        default: {
          connection.write(RESP.ERROR_UNKNOWN_COMMAND);
        }
      }
    } catch (e) {
      console.error("Parsing error:", e);
      connection.write(RESP.ERROR_PARSE);
    }
  });

  connection.on("end", () => {
    console.log("Connection ended");
  })
});

server.listen(6379, "127.0.0.1");
