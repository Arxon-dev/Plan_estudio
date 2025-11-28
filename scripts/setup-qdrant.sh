#!/bin/bash

# Script para configurar Qdrant en Railway

echo "🚀 Iniciando configuración de Qdrant en Railway..."

# Verificar si railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no encontrado. Por favor instálalo primero: npm i -g @railway/cli"
    exit 1
fi

# Conectar al proyecto (si no está conectado)
echo "🔗 Verificando conexión al proyecto..."
railway link

# Crear servicio Qdrant
echo "📦 Creando servicio Qdrant..."
railway service create --name qdrant --image qdrant/qdrant:latest

# Configurar variables
echo "⚙️ Configurando puerto..."
railway variables set QDRANT__SERVICE__HTTP_PORT=6333 --service qdrant

echo "✅ Configuración completada!"
echo "📋 Ejecuta 'railway variables' para ver la URL interna de conexión."
