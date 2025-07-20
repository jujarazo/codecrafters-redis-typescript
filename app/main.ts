import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

function parseRESP(buffer: Buffer ): string[] {
  const bufferParsed = buffer.toString();
  const lines = bufferParsed.split("\r\n");

  if (lines.length && lines[0].startsWith("*")) {
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

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection
  connection.on("data", (chunk) => {
    console.log("Received data: ", chunk.toLocaleString());

    try {
      const commandParts = parseRESP(chunk);
      const command = commandParts[0].toUpperCase();

      if (command === "PING") {
        connection.write("+PONG\r\n");
      } else if (command === "ECHO") {
        const message = commandParts[1] ?? "";
        connection.write(`$${message.length}\r\n${message}\r\n`);
      } else {
        connection.write("-ERR unknown command\r\n");
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
