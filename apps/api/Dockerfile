# syntax=docker/dockerfile:1.7

FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/api-client/package.json packages/api-client/
COPY packages/eslint-config/package.json packages/eslint-config/
RUN pnpm install --frozen-lockfile --filter @crm/api...
COPY . .
RUN pnpm -F @crm/api build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=9999
WORKDIR /app
RUN mkdir -p /data
RUN mkdir -p /seed
COPY --from=build /pnpm /pnpm
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/api-client/package.json packages/api-client/
COPY packages/eslint-config/package.json packages/eslint-config/
RUN pnpm install --prod --frozen-lockfile --filter @crm/api...
COPY apps/api/dev.db /seed/prod.db
COPY --from=build /app/apps/api/dist ./apps/api/dist
WORKDIR /app/apps/api
EXPOSE 9999
CMD ["/bin/sh", "-c", "cp -n /seed/prod.db /data/prod.db && node ./dist/src/index.js"]
