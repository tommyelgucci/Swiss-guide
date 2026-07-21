FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Se borra package-lock.json antes de instalar: el lockfile del repo se
# generó en x86_64 y trae resuelto el binario nativo de Rollup para esa
# arquitectura (npm/cli#4828 — optionalDependencies no viajan bien entre
# arquitecturas). Si el lockfile existe, "npm install" intenta respetarlo
# y puede no re-resolver el binario correcto para ARM64. Sin lockfile,
# npm resuelve todo desde cero para la máquina real donde se construye.
RUN rm -f package-lock.json && npm install
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY server ./server

EXPOSE 4321
CMD ["node", "server.js"]
