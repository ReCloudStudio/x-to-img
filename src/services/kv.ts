export interface FontKV {
  get(key: string): Promise<ArrayBuffer | null>
  put(key: string, value: ArrayBuffer): Promise<void>
}

export function cfFontKV(ns: KVNamespace): FontKV {
  return {
    get: (key) => ns.get(key, "arrayBuffer") as Promise<ArrayBuffer | null>,
    put: (key, value) => ns.put(key, value),
  }
}

let _denoKv: FontKV | null = null

export async function denoFontKV(): Promise<FontKV> {
  if (_denoKv) return _denoKv
  const kv = await (globalThis as any).Deno.openKv()
  _denoKv = {
    get: async (key) => {
      const r = await kv.get<ArrayBuffer>([key])
      return r.value ?? null
    },
    put: async (key, value) => {
      await kv.set([key], value)
    },
  }
  return _denoKv
}
