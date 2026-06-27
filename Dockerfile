FROM oven/bun:1-slim AS runner
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY . .
EXPOSE 3000
ENV PORT=3000
CMD ["bun", "run", "src/index.ts"]
