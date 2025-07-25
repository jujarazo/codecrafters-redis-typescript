export enum COMMANDS {
  PING = 'PING',
  ECHO = 'ECHO',
  GET = 'GET',
  SET = 'SET',
  RPUSH = 'RPUSH',
  LPUSH = 'LPUSH',
  LRANGE = 'LRANGE',
  LLEN= 'LLEN',
  LPOP = 'LPOP',
  BLPOP = 'BLPOP',
  TYPE = 'TYPE',
  XADD = 'XADD',
}

export enum SET_COMMANDS {
  PX = 'PX'
}

export enum RESP {
  OK = "+OK\r\n",
  NULL_BULK_STRING = "$-1\r\n",
  PONG = "+PONG\r\n",
  ERROR_UNKNOWN_COMMAND = "-ERR unknown command\r\n",
  ERROR_PARSE = "-ERR parsing failed\r\n",
  WRONG_TYPE = "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
  EMPTY_ARRAY = "*0\r\n",
  NONE = "+none\r\n",
  ID_IS_CERO = "-ERR The ID specified in XADD must be greater than 0-0\r\n",
  ID_IS_EQUAL_SMALLER = "-ERR The ID specified in XADD is equal or smaller than the target stream top item\r\n",
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

interface StreamValue {
  type: "stream";
  value: Array<{id: string, fields: Record<string, string>}>;
}

export type storedValue = StringValue | ListValue | StreamValue;
