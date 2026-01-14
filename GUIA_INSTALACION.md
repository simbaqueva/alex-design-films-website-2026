# 🚀 Guía Completa de Instalación y Configuración
## Bold Payment Integration - Backend Seguro

Esta guía te llevará paso a paso para configurar todo el sistema de pagos de Bold de forma segura.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 14 o superior)
- **npm** (viene con Node.js)
- Un editor de código (VS Code recomendado)
- Cuenta en Bold.co

### Verificar instalación de Node.js

Abre PowerShell y ejecuta:

```powershell
node --version
npm --version
```

Si no tienes Node.js instalado, descárgalo desde: https://nodejs.org/

---

## 🔧 Paso 1: Instalar Dependencias del Backend

### 1.1 Navegar a la carpeta del backend

```powershell
cd "C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films\backend"
```

### 1.2 Instalar todas las dependencias

```powershell
npm install
```

Esto instalará:
- `express` - Framework web
- `cors` - Manejo de CORS
- `dotenv` - Variables de entorno
- `helmet` - Seguridad HTTP
- `express-rate-limit` - Protección contra abuso
- `nodemon` - Desarrollo (reinicio automático)

**Tiempo estimado**: 1-2 minutos

---

## 🔑 Paso 2: Obtener Credenciales de Bold

### 2.1 Acceder a tu cuenta de Bold

1. Ve a: https://bold.co
2. Inicia sesión con tu cuenta
3. Ve a **Configuración** → **Integraciones**

### 2.2 Obtener las llaves

Necesitas dos llaves:

1. **API Key (Llave de Identidad)**
   - Esta es tu llave PÚBLICA
   - Se usa en el frontend
   - Ejemplo: `pk_test_abc123...`

2. **Secret Key (Llave Secreta)**
   - Esta es tu llave PRIVADA
   - Solo se usa en el backend
   - Ejemplo: `sk_test_xyz789...`
   - ⚠️ **NUNCA la expongas en el frontend**

### 2.3 Ambiente de Pruebas vs Producción

Bold te da dos sets de llaves:

- **Pruebas (Sandbox)**: Para desarrollo y testing
  - Empiezan con `pk_test_` y `sk_test_`
  - Los pagos NO son reales
  
- **Producción (Live)**: Para pagos reales
  - Empiezan con `pk_live_` y `sk_live_`
  - Los pagos SÍ son reales

**Recomendación**: Empieza con las llaves de prueba.

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env

En la carpeta `backend`, crea un archivo llamado `.env` (sin extensión):

```powershell
# Desde PowerShell en la carpeta backend
New-Item -Path ".env" -ItemType File
```

### 3.2 Editar el archivo .env

Abre el archivo `.env` con tu editor y pega esto (reemplazando con tus credenciales):

```env
# ===================================
# CREDENCIALES DE BOLD
# ===================================

# API Key - Reemplaza con tu llave real
BOLD_API_KEY=pk_test_TU_API_KEY_AQUI

# Secret Key - Reemplaza con tu llave real
BOLD_SECRET_KEY=sk_test_TU_SECRET_KEY_AQUI

# ===================================
# CONFIGURACIÓN DEL SERVIDOR
# ===================================

PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# ===================================
# CONFIGURACIÓN DE CORS
# ===================================

# URL de tu frontend
FRONTEND_URL=http://localhost:5500
```

### 3.3 Ejemplo con credenciales reales

```env
BOLD_API_KEY=pk_test_abc123def456ghi789
BOLD_SECRET_KEY=sk_test_xyz987uvw654rst321
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

⚠️ **IMPORTANTE**: 
- Reemplaza `TU_API_KEY_AQUI` y `TU_SECRET_KEY_AQUI` con tus llaves reales
- NO compartas este archivo
- NO lo subas a Git (ya está en .gitignore)

---

## 🎯 Paso 4: Configurar API Key en el Frontend

### 4.1 Abrir router.js

Abre el archivo:
```
sitio_web_oficial_alex_design_films\assets\js\core\router.js
```

### 4.2 Buscar la función initializeBoldPayment

Busca alrededor de la línea 390 y encontrarás:

```javascript
async initializeBoldPayment() {
    try {
        const { initializeBoldPayment, getBoldPaymentIntegration } = await import('../modules/bold-payment.js');
        
        // REEMPLAZA 'YOUR_BOLD_API_KEY' con tu API Key real
        const apiKey = 'YOUR_BOLD_API_KEY';
```

### 4.3 Reemplazar con tu API Key

Cambia la línea a:

```javascript
const apiKey = 'pk_test_TU_API_KEY_AQUI'; // Usa la MISMA que pusiste en .env
```

Ejemplo:
```javascript
const apiKey = 'pk_test_abc123def456ghi789';
```

---

## 🚀 Paso 5: Iniciar el Backend

### 5.1 Abrir PowerShell en la carpeta backend

```powershell
cd "C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films\backend"
```

### 5.2 Iniciar el servidor

Para desarrollo (con reinicio automático):
```powershell
npm run dev
```

O para producción:
```powershell
npm start
```

### 5.3 Verificar que funciona

Deberías ver algo como:

```
==================================================
🚀 Bold Payment Backend Server
==================================================
📍 Server running on: http://0.0.0.0:3001
🌍 Environment: development
🔒 CORS enabled for: http://localhost:5500
⏰ Started at: 2026-01-13T19:45:00.000Z
==================================================
```

### 5.4 Probar el backend

Abre tu navegador y ve a:
```
http://localhost:3001/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T19:45:00.000Z",
  "uptime": 5.123,
  "environment": "development"
}
```

✅ Si ves esto, ¡el backend está funcionando!

---

## 🌐 Paso 6: Iniciar el Frontend

### 6.1 Abrir nueva terminal de PowerShell

No cierres la terminal del backend. Abre una nueva.

### 6.2 Navegar a la carpeta del proyecto

```powershell
cd "C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films"
```

### 6.3 Iniciar servidor local

Si usas Live Server de VS Code:
- Click derecho en `index.html`
- Selecciona "Open with Live Server"

O usa Python:
```powershell
python -m http.server 5500
```

O usa Node.js http-server:
```powershell
npx http-server -p 5500
```

---

## ✅ Paso 7: Probar la Integración

### 7.1 Abrir el sitio web

Ve a: `http://localhost:5500`

### 7.2 Agregar productos al carrito

1. Ve a la tienda
2. Agrega uno o más productos al carrito

### 7.3 Ir a la página del carrito

1. Click en el ícono del carrito
2. O navega a: `http://localhost:5500/carrito`

### 7.4 Verificar el botón de Bold

Deberías ver:
- ✅ Resumen de tu compra
- ✅ Botón de pago de Bold (oscuro, grande)
- ✅ El botón dice "Pagar con Bold" o similar

### 7.5 Probar el flujo de pago

1. Click en el botón de Bold
2. Debería abrirse la pasarela de pagos (embedded)
3. Usa datos de prueba de Bold para completar el pago

---

## 🐛 Solución de Problemas

### Problema: El backend no inicia

**Error**: `Cannot find module 'express'`

**Solución**:
```powershell
cd backend
npm install
```

---

### Problema: El botón de Bold no aparece

**Verificar**:

1. ¿Hay productos en el carrito?
   - El botón solo aparece si hay productos

2. ¿El backend está corriendo?
   - Verifica en `http://localhost:3001/health`

3. ¿La API Key está configurada?
   - Revisa `router.js` línea ~390

4. Abre la consola del navegador (F12)
   - Busca errores en rojo
   - Busca el mensaje: "✅ Hash de integridad generado correctamente"

---

### Problema: Error de CORS

**Error en consola**: `Access to fetch at 'http://localhost:3001/api/bold/generate-hash' from origin 'http://localhost:5500' has been blocked by CORS`

**Solución**:

1. Verifica que `FRONTEND_URL` en `.env` sea correcto:
   ```env
   FRONTEND_URL=http://localhost:5500
   ```

2. Reinicia el backend:
   ```powershell
   # Ctrl+C para detener
   npm run dev
   ```

---

### Problema: Hash de integridad falla

**Error en consola**: `Error generando hash de integridad`

**Verificar**:

1. ¿El backend está corriendo?
2. ¿La `BOLD_SECRET_KEY` está configurada en `.env`?
3. ¿El puerto 3001 está libre?

**Probar manualmente**:

```powershell
# Desde PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/bold/generate-hash" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"orderId":"TEST-123","currency":"COP","amount":50000}'
```

Deberías ver:
```json
{
  "success": true,
  "hash": "abc123...",
  "orderId": "TEST-123"
}
```

---

## 📊 Estructura de Archivos

```
sitio_web_oficial_alex_design_films/
├── backend/
│   ├── server.js              ← Servidor backend
│   ├── package.json           ← Dependencias
│   ├── .env                   ← Credenciales (TU CREAS ESTE)
│   ├── .env.example           ← Plantilla
│   └── .gitignore             ← Archivos a ignorar
│
├── assets/
│   └── js/
│       ├── core/
│       │   └── router.js      ← Configurar API Key aquí
│       └── modules/
│           └── bold-payment.js ← Módulo de integración
│
└── index.html
```

---

## 🔒 Checklist de Seguridad

Antes de pasar a producción:

- [ ] Cambiar a credenciales de producción (live)
- [ ] Configurar HTTPS
- [ ] Actualizar `FRONTEND_URL` en `.env` a tu dominio real
- [ ] Configurar webhooks en Bold
- [ ] Implementar logging y monitoreo
- [ ] Hacer backup de la configuración
- [ ] Probar flujo completo end-to-end
- [ ] Configurar rate limiting más estricto
- [ ] Implementar base de datos para transacciones

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta guía completa
2. Verifica la consola del navegador (F12)
3. Verifica los logs del backend
4. Consulta la documentación de Bold: https://developers.bold.co

---

## 🎉 ¡Listo!

Si llegaste hasta aquí y todo funciona, ¡felicidades! Tienes una integración completa y segura de Bold Payments.

**Próximos pasos**:
1. Personalizar el diseño del botón
2. Configurar webhooks para validación
3. Implementar página de confirmación
4. Agregar manejo de errores mejorado
5. Pasar a producción

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0
