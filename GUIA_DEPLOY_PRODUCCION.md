# 🚀 Guía de Deploy a Producción
## Alex Design Films - Bold Payment Integration

Esta guía te llevará paso a paso para poner tu sitio web en producción con el sistema de pagos Bold completamente funcional.

---

## 📋 Tabla de Contenidos

1. [Preparación Pre-Deploy](#preparación-pre-deploy)
2. [Opciones de Hosting](#opciones-de-hosting)
3. [Deploy del Backend (Railway)](#deploy-del-backend-railway)
4. [Deploy del Frontend (Netlify)](#deploy-del-frontend-netlify)
5. [Configuración de Dominio](#configuración-de-dominio)
6. [Configuración de Bold en Producción](#configuración-de-bold-en-producción)
7. [Verificación Final](#verificación-final)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Preparación Pre-Deploy

### 1. Obtener Credenciales de Producción de Bold

1. **Accede a tu cuenta de Bold**
   - Ve a: https://bold.co
   - Inicia sesión

2. **Cambia a ambiente de Producción**
   - En el panel, busca el selector de ambiente
   - Cambia de "Sandbox/Pruebas" a "Producción/Live"

3. **Obtén tus llaves de producción**
   - Ve a: **Configuración** → **Integraciones**
   - Copia tu **API Key de producción** (empieza con `pk_live_`)
   - Copia tu **Secret Key de producción** (empieza con `sk_live_`)

⚠️ **IMPORTANTE**: Guarda estas llaves en un lugar seguro. Las necesitarás más adelante.

---

### 2. Preparar el Código para Producción

#### A. Actualizar `bold-payment.js`

Abre el archivo: `assets/js/modules/bold-payment.js`

Busca la función `getBackendUrl()` (alrededor de la línea 17) y actualízala:

```javascript
getBackendUrl() {
    const hostname = window.location.hostname;
    
    // Desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    
    // Producción - REEMPLAZA CON TU URL REAL DEL BACKEND
    return 'https://tu-backend.railway.app'; // Cambiar después del deploy
}
```

#### B. Actualizar `router.js`

Abre el archivo: `assets/js/core/router.js`

Busca la función `initializeBoldPayment()` (alrededor de la línea 390):

```javascript
async initializeBoldPayment() {
    try {
        const { initializeBoldPayment, getBoldPaymentIntegration } = await import('../modules/bold-payment.js');
        
        // REEMPLAZA con tu API Key de PRODUCCIÓN
        const apiKey = 'pk_live_TU_API_KEY_DE_PRODUCCION';
        
        await initializeBoldPayment(apiKey);
        // ...
    }
}
```

⚠️ **NOTA**: Por ahora deja el placeholder. Lo cambiarás después de configurar el backend.

---

### 3. Preparar Archivos para Git

Si aún no tienes tu proyecto en Git:

```powershell
# Navega a tu proyecto
cd "C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films"

# Inicializa Git
git init

# Agrega .gitignore en la raíz (si no existe)
New-Item -Path ".gitignore" -ItemType File
```

Contenido del `.gitignore` en la raíz:

```
# Node.js
node_modules/
npm-debug.log*

# Variables de entorno
.env
.env.local
.env.production

# Sistema operativo
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Archivos temporales
*.log
*.tmp
```

Agregar y hacer commit:

```powershell
git add .
git commit -m "Preparación para deploy a producción"
```

---

## 🌐 Opciones de Hosting

### Comparación de Plataformas

| Plataforma | Frontend | Backend | Precio | Dificultad | Recomendado |
|------------|----------|---------|--------|------------|-------------|
| **Railway** | ✅ | ✅ | $5/mes | Fácil | ⭐⭐⭐⭐⭐ |
| **Vercel** | ✅ | ✅ | Gratis/Pro | Fácil | ⭐⭐⭐⭐ |
| **Netlify + Railway** | ✅ | ✅ | Gratis + $5 | Fácil | ⭐⭐⭐⭐⭐ |
| **Heroku** | ✅ | ✅ | $7/mes | Media | ⭐⭐⭐ |
| **DigitalOcean** | ✅ | ✅ | $4/mes | Difícil | ⭐⭐⭐ |

### Recomendación

Para tu proyecto, te recomiendo:
- **Backend**: Railway ($5/mes)
- **Frontend**: Netlify (Gratis)

**Ventajas**:
- ✅ Fácil de configurar
- ✅ Deploy automático con Git
- ✅ HTTPS incluido
- ✅ Variables de entorno seguras
- ✅ Escalable
- ✅ Económico

---

## 🚂 Deploy del Backend (Railway)

### Paso 1: Crear Cuenta en Railway

1. Ve a: https://railway.app
2. Click en **"Start a New Project"**
3. Sign up con GitHub (recomendado)

### Paso 2: Subir Código a GitHub

Si no lo has hecho:

1. Crea un repositorio en GitHub
2. Sube tu código:

```powershell
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### Paso 3: Crear Proyecto en Railway

1. En Railway, click **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Autoriza Railway a acceder a GitHub
4. Selecciona tu repositorio
5. Railway detectará automáticamente que es un proyecto Node.js

### Paso 4: Configurar Variables de Entorno

1. En Railway, ve a tu proyecto
2. Click en la pestaña **"Variables"**
3. Agrega las siguientes variables:

```
BOLD_API_KEY=pk_live_TU_API_KEY_REAL
BOLD_SECRET_KEY=sk_live_TU_SECRET_KEY_REAL
FRONTEND_URL=https://tudominio.com
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

⚠️ **IMPORTANTE**: Reemplaza `TU_API_KEY_REAL` y `TU_SECRET_KEY_REAL` con tus credenciales reales de Bold.

### Paso 5: Configurar Build Settings

Railway lo detecta automáticamente, pero verifica:

1. Ve a **Settings** → **Build**
2. **Build Command**: `npm install` (automático)
3. **Start Command**: `npm start` (automático)
4. **Root Directory**: `/backend`

### Paso 6: Deploy

1. Railway hace deploy automáticamente
2. Espera a que termine (1-2 minutos)
3. Verás un mensaje: ✅ **"Deployed successfully"**

### Paso 7: Obtener URL del Backend

1. En Railway, ve a **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Railway te dará una URL como: `https://tu-proyecto-production.up.railway.app`
4. **Copia esta URL** - la necesitarás para el frontend

### Paso 8: Verificar que Funciona

Abre en tu navegador:
```
https://tu-proyecto-production.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "uptime": 123.45,
  "environment": "production"
}
```

✅ Si ves esto, ¡tu backend está funcionando!

---

## 🌐 Deploy del Frontend (Netlify)

### Paso 1: Actualizar URL del Backend

Antes de hacer deploy del frontend, actualiza la URL del backend:

1. Abre `assets/js/modules/bold-payment.js`
2. Busca la función `getBackendUrl()`
3. Reemplaza con la URL real de Railway:

```javascript
getBackendUrl() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    
    // URL REAL de tu backend en Railway
    return 'https://tu-proyecto-production.up.railway.app';
}
```

4. Guarda el archivo
5. Haz commit:

```powershell
git add .
git commit -m "Actualizar URL del backend para producción"
git push
```

### Paso 2: Crear Cuenta en Netlify

1. Ve a: https://netlify.com
2. Click **"Sign up"**
3. Sign up con GitHub (recomendado)

### Paso 3: Deploy desde GitHub

1. En Netlify, click **"Add new site"** → **"Import an existing project"**
2. Selecciona **"Deploy with GitHub"**
3. Autoriza Netlify
4. Selecciona tu repositorio
5. Configura el deploy:
   - **Base directory**: (dejar vacío)
   - **Build command**: (dejar vacío - es sitio estático)
   - **Publish directory**: `/` (raíz)

6. Click **"Deploy site"**

### Paso 4: Configurar Redirects para SPA

1. Crea un archivo `_redirects` en la raíz de tu proyecto:

```powershell
New-Item -Path "_redirects" -ItemType File
```

2. Contenido del archivo `_redirects`:

```
/*    /index.html   200
```

3. Haz commit:

```powershell
git add _redirects
git commit -m "Agregar redirects para SPA"
git push
```

Netlify hará redeploy automáticamente.

### Paso 5: Obtener URL del Frontend

Netlify te asigna una URL automática como:
```
https://random-name-123456.netlify.app
```

Puedes cambiarla:
1. Ve a **Site settings** → **Domain management**
2. Click **"Options"** → **"Edit site name"**
3. Cambia a algo como: `alex-design-films`
4. Tu URL será: `https://alex-design-films.netlify.app`

### Paso 6: Actualizar CORS en el Backend

1. Ve a Railway
2. Actualiza la variable `FRONTEND_URL`:

```
FRONTEND_URL=https://alex-design-films.netlify.app
```

3. Railway hará redeploy automático

### Paso 7: Verificar que Funciona

1. Abre tu sitio: `https://alex-design-films.netlify.app`
2. Agrega productos al carrito
3. Ve a la página del carrito
4. Verifica que aparece el botón de Bold
5. Abre la consola (F12) y busca:
   - ✅ "Hash de integridad generado correctamente"
   - ✅ "Bold payment button created"

---

## 🌍 Configuración de Dominio Personalizado

### Paso 1: Comprar un Dominio

Opciones recomendadas:
- **Namecheap**: https://namecheap.com (~$10/año)
- **Google Domains**: https://domains.google (~$12/año)
- **Hostinger**: https://hostinger.com (~$8/año)

Ejemplo: Compras `alexdesignfilms.com`

### Paso 2: Configurar Dominio en Netlify (Frontend)

1. En Netlify, ve a **Domain management**
2. Click **"Add custom domain"**
3. Ingresa tu dominio: `alexdesignfilms.com`
4. Netlify te dará instrucciones de DNS

### Paso 3: Configurar DNS

En tu proveedor de dominio (ej: Namecheap):

1. Ve a **Domain List** → **Manage** → **Advanced DNS**
2. Agrega estos registros:

**Para el dominio principal (frontend):**
```
Type: A Record
Host: @
Value: 75.2.60.5
TTL: Automatic
```

```
Type: CNAME Record
Host: www
Value: alex-design-films.netlify.app
TTL: Automatic
```

**Para el backend (subdominio api):**
```
Type: CNAME Record
Host: api
Value: tu-proyecto-production.up.railway.app
TTL: Automatic
```

### Paso 4: Configurar Dominio en Railway (Backend)

1. En Railway, ve a **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Ingresa: `api.alexdesignfilms.com`
4. Railway verificará el DNS

### Paso 5: Actualizar URLs en el Código

1. Actualiza `bold-payment.js`:

```javascript
getBackendUrl() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    
    // URL con dominio personalizado
    return 'https://api.alexdesignfilms.com';
}
```

2. Actualiza variable en Railway:

```
FRONTEND_URL=https://alexdesignfilms.com
```

3. Haz commit y push:

```powershell
git add .
git commit -m "Actualizar a dominio personalizado"
git push
```

### Paso 6: Esperar Propagación DNS

- Puede tomar de 5 minutos a 48 horas
- Generalmente funciona en 1-2 horas
- Verifica en: https://dnschecker.org

### Paso 7: Habilitar HTTPS

Netlify y Railway habilitan HTTPS automáticamente:
- Netlify: Let's Encrypt (automático)
- Railway: Certificado SSL (automático)

Espera unos minutos y verifica que tu sitio carga con `https://`

---

## 🔐 Configuración de Bold en Producción

### Paso 1: Configurar Webhooks

Los webhooks permiten que Bold notifique a tu backend cuando se completa un pago.

1. **En Bold.co**:
   - Ve a **Configuración** → **Webhooks**
   - Click **"Agregar Webhook"**
   - URL: `https://api.alexdesignfilms.com/webhooks/bold-payment`
   - Eventos: Selecciona "Pago aprobado", "Pago rechazado"
   - Guarda

2. **Probar Webhook**:
   - Bold tiene una opción para enviar un webhook de prueba
   - Verifica los logs en Railway para confirmar que se recibe

### Paso 2: Configurar URLs de Redirección

En tu código, las URLs de redirección ya están configuradas:

```javascript
redirectionUrl: window.location.origin + '/carrito?payment=success'
originUrl: window.location.origin + '/carrito?payment=abandoned'
```

Esto redirigirá a:
- Éxito: `https://alexdesignfilms.com/carrito?payment=success`
- Abandono: `https://alexdesignfilms.com/carrito?payment=abandoned`

### Paso 3: Crear Páginas de Confirmación (Opcional)

Puedes crear páginas específicas para mostrar el resultado del pago:

1. Crea `assets/components/payment-success.html`
2. Crea `assets/components/payment-error.html`
3. Agrega rutas en `router.js`

---

## ✅ Verificación Final

### Checklist de Producción

- [ ] **Backend desplegado en Railway**
  - [ ] Variables de entorno configuradas
  - [ ] Health check responde correctamente
  - [ ] Dominio personalizado configurado (opcional)

- [ ] **Frontend desplegado en Netlify**
  - [ ] Sitio accesible públicamente
  - [ ] Redirects configurados para SPA
  - [ ] Dominio personalizado configurado (opcional)

- [ ] **Credenciales de Bold**
  - [ ] Cambiadas a producción (pk_live_, sk_live_)
  - [ ] API Key configurada en frontend
  - [ ] Secret Key configurada en backend

- [ ] **Seguridad**
  - [ ] HTTPS habilitado (automático)
  - [ ] CORS configurado correctamente
  - [ ] Variables de entorno no expuestas
  - [ ] .env en .gitignore

- [ ] **Funcionalidad**
  - [ ] Botón de Bold aparece en carrito
  - [ ] Hash de integridad se genera correctamente
  - [ ] Pasarela de pagos se abre
  - [ ] Pago de prueba funciona

- [ ] **Webhooks**
  - [ ] URL configurada en Bold
  - [ ] Endpoint responde correctamente

### Prueba End-to-End

1. **Abre tu sitio**: `https://alexdesignfilms.com`
2. **Agrega productos** al carrito
3. **Ve al carrito**: `/carrito`
4. **Verifica** que aparece el botón de Bold
5. **Haz clic** en el botón
6. **Completa un pago de prueba** (usa tarjeta de prueba de Bold)
7. **Verifica** la redirección después del pago
8. **Revisa logs** en Railway para confirmar webhook

---

## 🐛 Troubleshooting

### Problema: Backend no responde

**Síntomas**: Error 502, 503, o timeout

**Soluciones**:
1. Verifica logs en Railway: **Deployments** → **View Logs**
2. Verifica que las variables de entorno están configuradas
3. Verifica que el puerto es dinámico: `process.env.PORT`
4. Reinicia el servicio en Railway

### Problema: Error de CORS

**Síntomas**: Error en consola sobre CORS

**Soluciones**:
1. Verifica `FRONTEND_URL` en Railway
2. Debe coincidir exactamente con tu dominio
3. Incluye `https://` y sin `/` al final
4. Reinicia el backend después de cambiar

### Problema: Botón de Bold no aparece

**Síntomas**: No se ve el botón en el carrito

**Verificar**:
1. ¿Hay productos en el carrito?
2. Abre consola (F12) y busca errores
3. Verifica que `getBackendUrl()` retorna la URL correcta
4. Prueba el endpoint manualmente: `/api/bold/generate-hash`

### Problema: Error generando hash

**Síntomas**: Error en consola sobre hash

**Soluciones**:
1. Verifica que `BOLD_SECRET_KEY` está en Railway
2. Verifica que el backend está corriendo
3. Prueba el endpoint directamente:

```powershell
Invoke-RestMethod -Uri "https://api.alexdesignfilms.com/api/bold/generate-hash" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"orderId":"TEST","currency":"COP","amount":50000}'
```

### Problema: DNS no resuelve

**Síntomas**: Dominio no carga

**Soluciones**:
1. Espera 24-48 horas para propagación
2. Verifica DNS en: https://dnschecker.org
3. Verifica que los registros están correctos
4. Limpia caché DNS local:

```powershell
ipconfig /flushdns
```

---

## 📊 Costos Mensuales Estimados

### Configuración Recomendada

| Servicio | Costo | Descripción |
|----------|-------|-------------|
| **Railway** (Backend) | $5/mes | 512MB RAM, 1GB storage |
| **Netlify** (Frontend) | Gratis | 100GB bandwidth, HTTPS |
| **Dominio** | ~$1/mes | $10-12/año |
| **Total** | **~$6/mes** | + $10-12 inicial por dominio |

### Alternativas

**Más económico** (Gratis):
- Frontend: Netlify (gratis)
- Backend: Render.com (gratis con limitaciones)
- Dominio: Usar subdominio gratis (.netlify.app)
- **Total: $0/mes**

**Más robusto** ($20/mes):
- Vercel Pro (incluye frontend + backend)
- Dominio personalizado
- **Total: ~$20/mes**

---

## 📞 Soporte y Recursos

### Documentación Oficial

- **Railway**: https://docs.railway.app
- **Netlify**: https://docs.netlify.com
- **Bold**: https://developers.bold.co

### Comunidades

- Railway Discord: https://discord.gg/railway
- Netlify Community: https://answers.netlify.com

### Monitoreo (Opcional)

Para producción seria, considera:
- **Sentry** (errores): https://sentry.io (gratis hasta 5k eventos/mes)
- **LogRocket** (sesiones): https://logrocket.com
- **UptimeRobot** (uptime): https://uptimerobot.com (gratis)

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí y todo funciona, ¡tienes un sitio web profesional en producción con pagos en línea!

### Próximos Pasos

1. **Monitoreo**: Configura alertas para errores
2. **Analytics**: Agrega Google Analytics
3. **SEO**: Optimiza meta tags y sitemap
4. **Performance**: Optimiza imágenes y assets
5. **Backup**: Configura backups automáticos
6. **Marketing**: ¡Empieza a vender!

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0  
**Autor**: Guía de Deploy - Alex Design Films
