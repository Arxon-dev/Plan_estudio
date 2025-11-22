# Dockerfile para Backend
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY . .

# Limpiar dist anterior y compilar TypeScript desde cero
RUN rm -rf dist
RUN npm run build

# Limpiar devDependencies después de compilar para reducir tamaño
RUN npm prune --production

# Exponer puerto
EXPOSE 8080

# Comando para iniciar
CMD ["npm", "start"]
