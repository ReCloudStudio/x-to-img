import satori from "satori"
import { Resvg, initWasm } from "@resvg/resvg-wasm"
import wasmBinary from "../../node_modules/@resvg/resvg-wasm/index_bg.wasm"
import { loadFonts, getSatoriFonts } from "./font"
import { TweetCard } from "./tweet-card"
import type { TweetData } from "../types"

let wasmReady = false

async function ensureWasm() {
  if (wasmReady) return
  await initWasm(wasmBinary)
  wasmReady = true
}

const CARD_W = 560
const SCALE = 3

export async function renderTweetToPNG(
  tweet: TweetData,
  theme: "light" | "dark" | "dim" = "light",
  kv?: KVNamespace
): Promise<Uint8Array> {
  await ensureWasm()
  const fonts = await loadFonts(kv)
  const satoriFonts = getSatoriFonts(fonts)

  const svg = await satori(
    <TweetCard tweet={tweet} theme={theme} />,
    {
      width: CARD_W,
      fonts: satoriFonts,
    }
  )

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: CARD_W * SCALE },
    shapeRendering: 2,
    textRendering: 2,
  })
  return resvg.render().asPng()
}
