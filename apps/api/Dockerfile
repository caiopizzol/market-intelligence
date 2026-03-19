FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

RUN bun install

COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api

EXPOSE 8787
CMD ["bun", "--hot", "src/index.ts"]
