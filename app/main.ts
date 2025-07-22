import * as net from "net";
import { COMMANDS, RESP } from "./types.ts";
import {parseRESP} from "./parser";
import {
  handleBLPop,
  handleEcho,
  handleGet,
  handleLLen,
  handleLPop,
  handleLPush,
  handleLRange,
  handleRpush,
  handleSet
} from "./handlers";

console.log("Logs from your program will appear here!");

const handlers: Record<string, (parts: string[], conn: net.Socket) => string | null> = {
  [COMMANDS.PING]: () => RESP.PONG,
  [COMMANDS.ECHO]: (parts) => handleEcho(parts),
  [COMMANDS.SET]: (parts) => { handleSet(parts); return RESP.OK; },
  [COMMANDS.GET]: (parts) => handleGet(parts),
  [COMMANDS.RPUSH]: (parts) => handleRpush(parts),
  [COMMANDS.LPUSH]: (parts) => handleLPush(parts),
  [COMMANDS.LRANGE]: (parts) => handleLRange(parts),
  [COMMANDS.LLEN]: (parts) => handleLLen(parts),
  [COMMANDS.LPOP]: (parts) => handleLPop(parts),
  [COMMANDS.BLPOP]: (parts, conn) => handleBLPop(parts, conn),
};

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (chunk) => {
    console.log("Received data: ", chunk.toString());

    try {
      const commandParts = parseRESP(chunk);
      const command = commandParts[0].toUpperCase();

      const handler = handlers[command];
      if (handler) {
        const res = handler(commandParts, connection);
        if (typeof res === "string") connection.write(res);
      } else {
        connection.write(RESP.ERROR_UNKNOWN_COMMAND);
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
