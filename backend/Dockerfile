FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.js ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

RUN npm run build

RUN npm prune --production --legacy-peer-deps

FROM node:22-alpine AS runner

USER node
WORKDIR /app

COPY --chown=node:node --from=builder /app/node_modules    ./node_modules
COPY --chown=node:node --from=builder /app/dist            ./dist
COPY --chown=node:node --from=builder /app/prisma          ./prisma
COPY --chown=node:node --from=builder /app/prisma.config.js ./prisma.config.js
COPY --chown=node:node package.json                        ./package.json

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/v1/health || exit 1

CMD ["node", "dist/main"]
