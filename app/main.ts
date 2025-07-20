import * as net from "net";

console.log("Logs from your program will appear here!");

enum COMMANDS {
  PING = 'PING',
  ECHO = 'ECHO',
  GET = 'GET',
  SET = 'SET'
}

const store = new Map<string, string>();

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

const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection
  connection.on("data", (chunk) => {
    console.log("Received data: ", chunk.toLocaleString());

    try {
      const commandParts = parseRESP(chunk);
      const command = commandParts[0].toUpperCase();

      switch (command) {
        case COMMANDS.PING:
          connection.write("+PONG\r\n");
          break;

        case COMMANDS.ECHO: {
          const message = commandParts[1] ?? "";
          connection.write(`$${message.length}\r\n${message}\r\n`);
          break;
        }

        case COMMANDS.SET: {
          const key = commandParts[1];
          const value = commandParts[2];
          store.set(key, value);
          connection.write("+OK\r\n");
          break;
        }

        case COMMANDS.GET: {
          const key = commandParts[1];
          const value = store.get(key);
          if (value === undefined) {
            connection.write("$-1\r\n");
          } else {
            connection.write(`$${value.length}\r\n${value}\r\n`);
          }
          break;
        }
        default: {
          connection.write("-ERR unknown command\r\n");
        }
      }
    } catch (e) {
      console.error("Parsing error:", e);
      connection.write("-ERR parsing failed\r\n");
    }
  });

  connection.on("end", () => {
    console.log("Connection ended");
  })
});

server.listen(6379, "127.0.0.1");
