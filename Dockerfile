# Etapa de build
FROM oven/bun:1 AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json ./

# Instalamos dependencias
RUN bun install

# Copiamos el código fuente
COPY . .

# Construimos la aplicación (ahora genera output: 'standalone')
RUN bun run build

# Etapa final (runtime)
FROM oven/bun:1-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app ./

EXPOSE 3000

# Arrancamos usando el servidor standalone
CMD ["bun", "run", "start"]