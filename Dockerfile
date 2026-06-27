FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun build src/index.ts --target=bun --outdir=dist

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/@resvg/resvg-wasm/index_bg.wasm ./node_modules/@resvg/resvg-wasm/index_bg.wasm
EXPOSE 3000
ENV PORT=3000
CMD ["bun", "run", "dist/index.js"]
