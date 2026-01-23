# --- Etapa 1: Construcción ---
FROM node:lts-alpine AS builder

RUN npm -g install pnpm
WORKDIR /app

# 1. Copiar solo package.json
COPY package.json ./

# 2. Instalar dependencias
RUN pnpm install

# Instalar librería faltante
RUN pnpm add @radix-ui/react-avatar

# 3. COPIA SELECTIVA (¡Aquí agregamos el .env!)
COPY .env ./
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.ts ./
COPY eslint.config.js ./
COPY components.json ./
COPY src ./src
COPY public ./public

# 4. Construir (Ahora sí leerá el .env)
RUN pnpm run build

# --- Etapa 2: Producción (Nginx) ---
FROM nginx:alpine AS production

RUN apk add --no-cache tzdata
ENV TZ=America/Guayaquil

# Copiar lo construido
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración Nginx
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]