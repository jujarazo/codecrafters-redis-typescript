import { RESP } from "../types.ts";
import * as redisStore from "../store.ts";
import {formatId, isIdGreater, parseEntryId} from "../helpers.ts";


export function handleXAdd(parts: string[]): string {
  const key = parts[1];
  const rawId = parts[2];
  let entryId = rawId;

  if (!/^\d+-\*?$/.test(rawId) && !/^\d+-\d+$/.test(rawId)) {
    return RESP.ERROR_PARSE;
  }

  const [msPart, seqPart] = parseEntryId(rawId);

  const fields: Record<string, string> = {};
  for (let i = 3; i < parts.length; i += 2) {
    const field = parts[i];
    const value = parts[i + 1];
    if (!value) return RESP.ERROR_PARSE;
    fields[field] = value;
  }

  let stream = redisStore.get(key);

  if (!stream) {
    stream = { type: "stream", value: [] };
    redisStore.set(key, stream);
  }

  if (stream.type !== "stream") return RESP.WRONG_TYPE;

  if (seqPart === "*") {
    let nextSeq = 0;
    const sameTimeEntries = stream.value.filter((e) => e.id.startsWith(`${msPart}-`));
    if (sameTimeEntries.length > 0) {
      const lastSeq = Math.max(...sameTimeEntries.map((e) => parseInt(e.id.split("-")[1])));
      nextSeq = lastSeq + 1;
    } else if (msPart === 0) {
      nextSeq = 1;
    }
    entryId = formatId(msPart, nextSeq);
  }

  const [msFinal, seqFinal] = parseEntryId(entryId);

  if (msFinal === 0 && seqFinal === 0) {
    return RESP.ID_IS_CERO;
  }

  const last = stream.value.at(-1);
  if (last && !isIdGreater(entryId, last.id)) {
    return RESP.ID_IS_EQUAL_SMALLER;
  }

  stream.value.push({ id: entryId, fields });

  return `$${entryId.length}\r\n${entryId}\r\n`;
}
