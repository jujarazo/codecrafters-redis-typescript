export enum COMMANDS {
  PING = 'PING',
  ECHO = 'ECHO',
  GET = 'GET',
  SET = 'SET'
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

export interface storedValue {
  value: string;
  expiresAt?: number;
}