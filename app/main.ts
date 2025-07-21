import * as net from "net";
import {COMMANDS, RESP} from "./types.ts";
import {parseRESP} from "./parser";
import {
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

const server: net.Server = net.createServer((connection: net.Socket) => {
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
          connection.write(handleEcho(commandParts));
          break;
        }

        case COMMANDS.SET: {
          handleSet(commandParts);
          connection.write(RESP.OK);
          break;
        }

        case COMMANDS.GET: {
          connection.write(handleGet(commandParts));
          break;
        }

        case COMMANDS.RPUSH: {
          connection.write(handleRpush(commandParts))
          break;
        }

        case COMMANDS.LPUSH: {
          connection.write(handleLPush(commandParts));
          break;
        }

        case COMMANDS.LRANGE: {
          connection.write(handleLRange(commandParts));
          break;
        }

        case COMMANDS.LLEN: {
          connection.write(handleLLen(commandParts));
          break;
        }

        case COMMANDS.LPOP: {
          connection.write(handleLPop(commandParts));
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
