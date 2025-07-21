export enum COMMANDS {
  PING = 'PING',
  ECHO = 'ECHO',
  GET = 'GET',
  SET = 'SET',
  RPUSH = 'RPUSH',
}

export enum SET_COMMANDS {
  PX = 'PX'
}

export enum RESP {
  OK = "+OK\r\n",
  NULL_BULK_STRING = "$-1\r\n",
  PONG = "+PONG\r\n",
  ERROR_UNKNOWN_COMMAND = "-ERR unknown command\r\n",
  ERROR_PARSE = "-ERR parsing failed\r\n"
}

interface StringValue {
  type: "string";
  value: string;
  expiresAt?: number;
}

interface ListValue {
  type: "list";
  value: string[];
  expiresAt?: number;
}

export type storedValue = StringValue | ListValue;
