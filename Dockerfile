FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# npm install (not npm ci): el lockfile puede no listar el binario nativo
# de Rollup para la arquitectura de build (npm/cli#4828 — optionalDependencies
# no siempre viajan bien entre arquitecturas distintas). npm install
# re-resuelve el binario correcto para la máquina donde se construye.
RUN npm install
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
