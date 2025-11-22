# 🚀 Guía de Despliegue en Railway

## 📌 Requisitos Previos
1. Cuenta en Railway (https://railway.app)
2. Tu proyecto subido a GitHub (opcional pero recomendado)
3. Base de datos MySQL accesible desde internet (ya la tienes configurada)

---

## 🎯 PASO A PASO COMPLETO

### **PARTE 1: DESPLEGAR EL BACKEND**

#### 1️⃣ Crear el servicio de Backend

1. Ve a Railway.app y haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"** (o **"Empty Project"** si prefieres)
3. Si usas GitHub:
   - Conecta tu repositorio
   - Railway detectará automáticamente que hay un Dockerfile
4. Si no usas GitHub:
   - Crea un nuevo proyecto vacío
   - Luego podrás subir el código manualmente

#### 2️⃣ Configurar el Backend
PORT=3000

# Database (usa tus valores actuales)
DB_HOST=srv1702.hstgr.io
DB_PORT=3306
DB_NAME=u449034524_plan_estudio
DB_USER=u449034524_plan_estudio
DB_PASSWORD=Sirius//03072503//
DB_SYNC=true
DB_SYNC_ALTER=false

# JWT (IMPORTANTE: cambia esto por un secreto seguro nuevo)
JWT_SECRET=tu_secreto_super_seguro_cambiar_esto
JWT_EXPIRES_IN=7d

# CORS (se configurará después)
CORS_ORIGIN=*

# Temas con partes
ENABLE_PARTS_COLUMNS=true

# Stripe (Pagos)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# IA (Generación de Preguntas y Análisis)
Z_AI_API_KEY=tu_api_key_de_zhipu
Z_AI_MODEL=glm-4-flash
AI_QUESTION_GENERATION=true
GEMINI_API_KEY=tu_api_key_de_google_gemini


```

**⚠️ IMPORTANTE:** Cambia `JWT_SECRET` por un valor aleatorio seguro.

**D. Dominio del Backend:**
- Railway te asignará automáticamente un dominio como: `https://tu-app-backend.up.railway.app`
- **Copia esta URL** porque la necesitarás para el frontend

#### 3️⃣ Ejecutar Migraciones y Seed

Una vez desplegado el backend:

1. Ve a la pestaña **Settings**
2. En **Deploy Triggers**, asegúrate que está activado
3. Después del primer despliegue, ve a **Deployments**
4. Haz clic en los tres puntos (...) del deployment activo
5. Selecciona **"Run Command"**
6. Ejecuta uno por uno:
   ```
   npm run migrate
   npm run seed
   ```

---

### **PARTE 2: DESPLEGAR EL FRONTEND**

#### 1️⃣ Crear el servicio de Frontend

1. En el mismo proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"** (el mismo repositorio) o **"Empty Service"**
3. Se creará un segundo servicio

#### 2️⃣ Configurar el Frontend

**A. Root Directory:**
- Ve a **Settings**
- En **Root Directory**, escribe: `frontend`

**B. Variables de Entorno:**
Ve a **Variables** y añade:

```
VITE_API_URL=https://tu-app-backend.up.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PREMIUM_PRICE_ID=price_... (ID del precio en Stripe)


```

**⚠️ IMPORTANTE:** Reemplaza `tu-app-backend.up.railway.app` con la URL real que Railway asignó a tu backend.

**C. Builder:**
- **Dockerfile Path:** `Dockerfile` (Relativo al Root Directory, NO pongas `/frontend/Dockerfile`)
- Railway detectará automáticamente el `Dockerfile` dentro de la carpeta `frontend/`


**D. Configuración adicional:**
- En **Settings** → **Networking** → asegúrate que el puerto es **80** (puerto de nginx)

---

### **PARTE 3: CONECTAR FRONTEND Y BACKEND**

#### 1️⃣ Actualizar CORS en el Backend

1. Ve al servicio de **Backend** en Railway
2. En **Variables**, actualiza `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://tu-app-frontend.up.railway.app
   ```
   (Reemplaza con la URL que Railway asignó a tu frontend)

3. Si necesitas múltiples orígenes (para desarrollo local también):
   ```
   CORS_ORIGIN=https://tu-app-frontend.up.railway.app,http://localhost:5173
   ```

#### 2️⃣ Verificar que todo funciona

1. Abre la URL del frontend: `https://tu-app-frontend.up.railway.app`
2. Intenta hacer login o registrarte
3. Verifica que las peticiones al backend funcionan

---

## 🔧 CONFIGURACIÓN ADICIONAL (OPCIONAL)

### Dominios Personalizados

Si quieres usar tu propio dominio:

1. Ve a **Settings** → **Domains**
2. Haz clic en **"Generate Domain"** o **"Custom Domain"**
3. Sigue las instrucciones para configurar tu DNS

### Monitoreo y Logs

- En cada servicio, ve a **Deployments** para ver logs
- Usa **Metrics** para ver uso de CPU y memoria
- **Settings** → **Health Checks** para configurar verificaciones de salud

### Variables de Entorno Compartidas

Railway permite variables compartidas entre servicios:
1. Ve a **Project Settings**
2. **Shared Variables**
3. Añade variables que ambos servicios necesitan

---

## 📝 RESUMEN RÁPIDO

### Backend:
- ✅ Root Directory: `backend`
- ✅ Dockerfile: Detectado automáticamente
- ✅ Variables: PORT, DB_*, JWT_*, CORS_ORIGIN
- ✅ Comandos post-deploy: `npm run migrate` y `npm run seed`

### Frontend:
- ✅ Root Directory: `frontend`
- ✅ Dockerfile: Detectado automáticamente
- ✅ Variables: VITE_API_URL (apuntando al backend)
- ✅ Puerto: 80 (nginx)

### Conexión:
- ✅ CORS_ORIGIN en backend = URL del frontend
- ✅ VITE_API_URL en frontend = URL del backend + `/api`

---

## ❗ PROBLEMAS COMUNES

### Backend no inicia
- Verifica las variables de entorno de la base de datos
- Revisa los logs en **Deployments**
- Asegúrate que la base de datos es accesible desde internet

### Frontend no se conecta al Backend
- Verifica que `VITE_API_URL` es correcta
- Verifica que `CORS_ORIGIN` en el backend incluye la URL del frontend
- Abre la consola del navegador para ver errores

### Build falla
- Verifica que los `Dockerfile` están en las carpetas correctas
- Revisa los logs de build en Railway
- Asegúrate que `package.json` tiene los scripts necesarios

---

## 🆘 SOPORTE

Si tienes problemas:
1. Revisa los logs en Railway
2. Verifica las variables de entorno
3. Comprueba que los Dockerfiles están en las carpetas correctas
4. Asegúrate que la base de datos acepta conexiones externas

---

**¡Tu aplicación debería estar funcionando en Railway!** 🎉

---

## 🌐 CONFIGURACIÓN DE DOMINIO PERSONALIZADO

Si deseas usar tu propio dominio (ej. `opomelilla.com`), sigue estos pasos con atención.

### 1️⃣ Configurar Dominios en Railway

1.  **Frontend**:
    -   Ve a tu servicio de **Frontend** > **Settings** > **Domains**.
    -   Añade tu dominio, por ejemplo: `app.opomelilla.com`.
    -   Railway te dará unos registros DNS (CNAME) que debes añadir en tu proveedor de dominio (donde compraste el dominio).

2.  **Backend**:
    -   Ve a tu servicio de **Backend** > **Settings** > **Domains**.
    -   Añade tu subdominio para la API, por ejemplo: `api.opomelilla.com`.
    -   Configura el DNS correspondiente.

### 2️⃣ Actualizar Variables de Entorno (CRÍTICO)

Una vez que tus dominios estén activos, debes actualizar las variables. **Es fundamental incluir `https://`**.

#### En el servicio FRONTEND:
Cambia `VITE_API_URL` para que apunte a tu nuevo dominio de backend.
```
VITE_API_URL=https://api.opomelilla.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PREMIUM_PRICE_ID=price_...


```
❌ **MAL:** `api.opomelilla.com/api` (Esto causará errores de ruta relativa)
✅ **BIEN:** `https://api.opomelilla.com/api`

#### En el servicio BACKEND:
Cambia `CORS_ORIGIN` para autorizar a tu nuevo dominio de frontend.
```
CORS_ORIGIN=https://app.opomelilla.com
```
❌ **MAL:** `app.opomelilla.com` (El navegador bloqueará la petición)
✅ **BIEN:** `https://app.opomelilla.com`

---

## ❗ SOLUCIÓN DE PROBLEMAS COMUNES

### Error 405 Method Not Allowed / URL extraña
Si ves un error como `POST https://app.opomelilla.com/api.opomelilla.com/api/...` en la consola:
-   **Causa**: Te falta el `https://` en la variable `VITE_API_URL`.
-   **Solución**: Pon la URL completa: `https://api.opomelilla.com/api`.

### Error de CORS (Bloqueo de acceso)
Si la consola dice "Access to XMLHttpRequest... has been blocked by CORS policy":
-   **Causa**: El backend no reconoce el origen `https://app.opomelilla.com`.
-   **Solución**: Asegúrate de que `CORS_ORIGIN` en el backend sea EXACTAMENTE `https://app.opomelilla.com` (sin barra al final).

