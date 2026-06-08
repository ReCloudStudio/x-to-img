const FONT_ZIP_URL = "https://github.com/subframe7536/maple-font/releases/download/v7.9/MapleMono-CN.zip";

const TARGET_FILES = ["MapleMono-CN-Regular.ttf", "MapleMono-CN-Bold.ttf"] as const;

interface FontCache {
  regular: ArrayBuffer;
  bold: ArrayBuffer;
}

let fontCache: FontCache | null = null;

function readU16(buf: Uint8Array, off: number) {
  return (buf[off] | (buf[off + 1] << 8)) >>> 0;
}

function readU32(buf: Uint8Array, off: number) {
  return (buf[off] | (buf[off + 1] << 8) | (buf[off + 2] << 16) | (buf[off + 3] << 24)) >>> 0;
}

function findEOCD(buf: Uint8Array) {
  const maxSearch = Math.min(buf.length, 65557);
  for (let i = buf.length - 22; i >= buf.length - maxSearch; i--) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x05 && buf[i + 3] === 0x06) {
      return i;
    }
  }
  return -1;
}

function unzip(zipped: ArrayBuffer, filenames: readonly string[]) {
  const buf = new Uint8Array(zipped);
  const eocdOff = findEOCD(buf);
  if (eocdOff < 0) throw new Error("Invalid ZIP: EOCD not found");

  const entriesTotal = readU16(buf, eocdOff + 10);
  const cdSize = readU32(buf, eocdOff + 12);
  const cdOff = readU32(buf, eocdOff + 16);

  const result = new Map<string, ArrayBuffer>();

  let pos = cdOff;
  for (let i = 0; i < entriesTotal; i++) {
    const sig = readU32(buf, pos);
    if (sig !== 0x02014b50) throw new Error("Invalid central directory entry");
    const method = readU16(buf, pos + 10);
    const compSize = readU32(buf, pos + 20);
    const uncompSize = readU32(buf, pos + 24);
    const nameLen = readU16(buf, pos + 28);
    const extraLen = readU16(buf, pos + 30);
    const commentLen = readU16(buf, pos + 32);
    const localOff = readU32(buf, pos + 42);

    const name = new TextDecoder().decode(buf.subarray(pos + 46, pos + 46 + nameLen));

    if (filenames.includes(name)) {
      const lhPos = localOff;
      const lhNameLen = readU16(buf, lhPos + 26);
      const lhExtraLen = readU16(buf, lhPos + 28);
      const dataOff = lhPos + 30 + lhNameLen + lhExtraLen;

      let data: ArrayBuffer;
      if (method === 0) {
        data = buf.slice(dataOff, dataOff + uncompSize).buffer;
      } else if (method === 8) {
        const compressed = buf.subarray(dataOff, dataOff + compSize);
        data = Bun.inflate(compressed).buffer;
      } else {
        throw new Error(`Unsupported compression method: ${method}`);
      }
      result.set(name, data);
    }

    pos += 46 + nameLen + extraLen + commentLen;
  }

  return result;
}

export async function loadFonts(): Promise<FontCache> {
  if (fontCache) return fontCache;

  const resp = await fetch(FONT_ZIP_URL);
  if (!resp.ok) throw new Error(`Failed to download fonts: ${resp.status}`);
  const zipBuf = await resp.arrayBuffer();

  const files = unzip(zipBuf, TARGET_FILES);
  const regular = files.get("MapleMono-CN-Regular.ttf");
  const bold = files.get("MapleMono-CN-Bold.ttf");
  if (!regular || !bold) throw new Error("Font files not found in zip");

  fontCache = { regular, bold };
  return fontCache;
}

export function getSatoriFonts(fonts: FontCache) {
  return [
    {
      name: "Maple Mono CN",
      data: fonts.regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Maple Mono CN",
      data: fonts.bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}
