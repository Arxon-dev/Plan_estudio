# Dockerfile para Backend
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Limpiar devDependencies después de compilar para reducir tamaño
RUN npm prune --production

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
