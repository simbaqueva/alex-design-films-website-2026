# 🚀 Guía de Deployment - Alex Design Films

## 📋 Tabla de Contenidos
1. [Cómo Iniciar en Localhost](#-cómo-iniciar-en-localhost)
2. [GitHub Pages - ¿Funcionará Todo?](#-github-pages---funcionará-todo)
3. [Plan de Deploy Recomendado](#-plan-de-deploy-recomendado)
4. [Cambios para GitHub Pages](#-cambios-necesarios-para-github-pages)
5. [Mi Recomendación](#-mi-recomendación)
6. [Resumen de Comandos](#-resumen-de-comandos)
7. [Preguntas Frecuentes](#-preguntas-frecuentes)

---

## 🚀 Cómo Iniciar en Localhost

### **Opción 1: Solo el Sitio Web (Sin Webhooks)**

Abre **PowerShell** en la carpeta de tu proyecto y ejecuta:

```powershell
# Navegar a la carpeta del proyecto
cd C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films

# Iniciar el servidor web
python server.py
```

Verás:
```
Servidor SPA corriendo en puerto 8000
Presiona Ctrl+C para detener
```

Luego abre tu navegador en:
```
http://localhost:8000
```

**¡Listo!** Ya puedes probar:
- ✅ Agregar productos al carrito
- ✅ Ver el formulario de checkout
- ✅ Abrir el widget de Wompi
- ✅ Hacer pagos de prueba

---

### **Opción 2: Sitio Web + Webhooks (Completo)**

Necesitas **2 terminales de PowerShell**:

**Terminal 1 - Servidor Web:**
```powershell
cd C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films
python server.py
```

**Terminal 2 - Servidor Webhook:**
```powershell
cd C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films
python wompi_webhook.py
```

Ahora tienes:
- 🌐 Sitio web: `http://localhost:8000`
- 🔔 Webhook: `http://localhost:8080/webhook`

**Nota:** Para que Wompi envíe webhooks a tu localhost, necesitas **ngrok** (explicado abajo).

---

## 📦 GitHub Pages - ¿Funcionará Todo?

### ✅ **Lo que SÍ funciona en GitHub Pages:**

1. ✅ **Tu sitio web completo** (HTML, CSS, JS)
2. ✅ **El carrito de compras** (funciona en el navegador)
3. ✅ **El widget de Wompi** (se abre desde el navegador)
4. ✅ **Pagos reales** (Wompi funciona 100%)
5. ✅ **Formulario de checkout**
6. ✅ **Todos los métodos de pago** (Tarjeta, Nequi, PSE)

### ❌ **Lo que NO funciona en GitHub Pages:**

1. ❌ **Webhooks** (GitHub Pages no soporta backend Python)
2. ❌ **`server.py`** (GitHub Pages solo sirve archivos estáticos)
3. ❌ **`wompi_webhook.py`** (necesita un servidor con Python)

---

## 🎯 Solución Recomendada

### **Para GitHub Pages:**

**Desplegar el sitio web SIN webhooks:**

1. ✅ Tu sitio funciona perfectamente
2. ✅ Los pagos se procesan normalmente
3. ✅ Los usuarios pueden comprar
4. ❌ No recibes notificaciones automáticas de webhooks

**¿Es suficiente?** 

**¡SÍ!** Para empezar, puedes:
- Ver los pagos en tu panel de Wompi: [comercios.wompi.co](https://comercios.wompi.co)
- Revisar transacciones manualmente
- Los clientes reciben confirmación de Wompi

---

### **Para Webhooks (Opcional - Más Profesional):**

Necesitas desplegar `wompi_webhook.py` en un servidor separado:

**Opciones GRATUITAS:**

1. **Render.com** (Recomendado - Gratis)
   - Soporta Python
   - Deploy automático desde GitHub
   - URL: `https://tu-app.onrender.com/webhook`

2. **Railway.app** (Gratis con límites)
   - Muy fácil de usar
   - Deploy en 2 minutos

3. **Vercel** (Gratis)
   - Necesitas convertir a serverless function
   - Un poco más técnico

4. **PythonAnywhere** (Gratis)
   - Específico para Python
   - Fácil de configurar

---

## 📋 Plan de Deploy Recomendado

### **Fase 1: GitHub Pages (Sitio Web)**

```powershell
# 1. Crear repositorio en GitHub (hazlo en github.com primero)

# 2. Subir tu código
cd C:\Users\janus\Downloads\sitio_web_oficial_alex_design_films

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/alex-design-films.git
git push -u origin main

# 3. Activar GitHub Pages
# Ve a: Settings → Pages → Source: main branch → Save
```

**URL resultante:**
```
https://TU_USUARIO.github.io/alex-design-films
```

**⚠️ IMPORTANTE:** Necesitas hacer un pequeño cambio para GitHub Pages:

Como GitHub Pages usa rutas como `/alex-design-films/`, necesitas actualizar las rutas en tu código.

**Opción más simple:** Usa un dominio personalizado (gratis con GitHub Pages)

---

### **Fase 2: Webhook en Render (Opcional)**

1. Crea cuenta en [render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un "Web Service"
4. Selecciona `wompi_webhook.py`
5. Render te da una URL: `https://tu-webhook.onrender.com`
6. Configura esa URL en Wompi

---

## 🔧 Cambios Necesarios para GitHub Pages

### **Opción A: Con Subdirectorio (ej: /alex-design-films)**

Si tu sitio estará en `https://usuario.github.io/alex-design-films/`, necesitas:

1. Actualizar rutas en `index.html`:
   ```html
   <!-- Cambiar de: -->
   <link rel="stylesheet" href="./assets/css/main.css">
   
   <!-- A: -->
   <link rel="stylesheet" href="./alex-design-films/assets/css/main.css">
   ```

2. Actualizar rutas en JavaScript (router.js, etc.)

### **Opción B: Con Dominio Personalizado (Recomendado)**

Si usas un dominio como `alexdesignfilms.com`:

1. ✅ No necesitas cambiar rutas
2. ✅ Todo funciona tal cual
3. ✅ Más profesional

**Cómo configurar dominio personalizado:**
1. Compra un dominio (ej: Namecheap, GoDaddy)
2. En GitHub Pages: Settings → Pages → Custom domain
3. Configura DNS según instrucciones de GitHub

---

## 💡 Mi Recomendación

### **Para Empezar (Hoy mismo):**

1. ✅ Usa **GitHub Pages** para el sitio web
2. ✅ Los pagos funcionarán perfectamente
3. ❌ Sin webhooks (revisa pagos en panel de Wompi)

**Pasos:**
```powershell
# 1. Probar en localhost
python server.py

# 2. Si todo funciona, subir a GitHub
git init
git add .
git commit -m "Deploy to GitHub Pages"
git push

# 3. Activar GitHub Pages en Settings
```

### **Para Profesionalizar (Después):**

1. ✅ Agrega un dominio personalizado (ej: `alexdesignfilms.com`)
2. ✅ Despliega webhook en Render.com (gratis)
3. ✅ Configura webhook en Wompi

---

## 📝 Resumen de Comandos

### **Localhost (Pruebas):**

```powershell
# Solo sitio web
python server.py
# Abre: http://localhost:8000

# Con webhooks (2 terminales)
# Terminal 1:
python server.py

# Terminal 2:
python wompi_webhook.py
```

### **GitHub Pages (Deploy):**

```powershell
# Primera vez
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main

# Actualizaciones posteriores
git add .
git commit -m "Actualización del sitio"
git push
```

### **Ngrok (Para probar webhooks en localhost):**

```powershell
# Descargar ngrok de: https://ngrok.com/download

# Exponer puerto 8080 (webhook)
ngrok http 8080

# Te dará una URL como: https://abc123.ngrok.io
# Configúrala en Wompi como: https://abc123.ngrok.io/webhook
```

---

## ❓ Preguntas Frecuentes

### **¿Puedo usar Wompi en GitHub Pages?**
✅ **SÍ**, el widget de Wompi funciona perfectamente en sitios estáticos.

### **¿Necesito webhooks obligatoriamente?**
❌ **NO**, puedes revisar pagos en el panel de Wompi: [comercios.wompi.co](https://comercios.wompi.co)

### **¿GitHub Pages es gratis?**
✅ **SÍ**, completamente gratis e ilimitado.

### **¿Puedo usar mi propio dominio?**
✅ **SÍ**, GitHub Pages soporta dominios personalizados gratis.

### **¿Cómo veo los pagos sin webhooks?**
Ve a tu panel de Wompi → Transacciones. Ahí verás todos los pagos en tiempo real.

### **¿Puedo cambiar de GitHub Pages a otro hosting después?**
✅ **SÍ**, tu código funciona en cualquier hosting estático (Netlify, Vercel, etc.)

### **¿Los clientes pueden pagar sin webhooks?**
✅ **SÍ**, los pagos funcionan normalmente. Los webhooks son solo para TU notificación.

---

## 🎯 Checklist de Deploy

### **Antes de Desplegar:**

- [ ] Probado en localhost (`python server.py`)
- [ ] Carrito funciona correctamente
- [ ] Formulario de checkout funciona
- [ ] Widget de Wompi se abre
- [ ] Configurada llave pública de Wompi
- [ ] Decidido: ¿con o sin webhooks?

### **Deploy en GitHub Pages:**

- [ ] Repositorio creado en GitHub
- [ ] Código subido (`git push`)
- [ ] GitHub Pages activado en Settings
- [ ] Sitio accesible en URL de GitHub
- [ ] Probado en la URL pública
- [ ] Pago de prueba exitoso

### **Opcional - Webhooks:**

- [ ] Cuenta en Render.com creada
- [ ] `wompi_webhook.py` desplegado
- [ ] URL del webhook configurada en Wompi
- [ ] Secret de eventos configurado
- [ ] Probado con pago real

### **Opcional - Dominio Personalizado:**

- [ ] Dominio comprado
- [ ] DNS configurado
- [ ] Dominio agregado en GitHub Pages
- [ ] HTTPS habilitado
- [ ] Sitio accesible en dominio personalizado

---

## 🛠️ Troubleshooting

### **Problema: El sitio no carga en GitHub Pages**

**Solución:**
1. Verifica que GitHub Pages esté activado
2. Espera 5-10 minutos (primera vez)
3. Verifica que el branch sea `main`
4. Revisa la consola del navegador (F12)

### **Problema: Wompi no se abre**

**Solución:**
1. Verifica tu llave pública en `wompi-config.js`
2. Abre la consola del navegador (F12)
3. Busca errores de JavaScript
4. Verifica que tengas internet

### **Problema: Los webhooks no llegan**

**Solución:**
1. Verifica que la URL esté bien configurada en Wompi
2. Verifica que el servidor webhook esté corriendo
3. Revisa los logs del servidor
4. Prueba con ngrok en localhost primero

### **Problema: Git no funciona**

**Solución:**
```powershell
# Instalar Git si no lo tienes
# Descargar de: https://git-scm.com/download/win

# Verificar instalación
git --version
```

---

## 📞 Recursos y Soporte

### **Documentación:**
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Wompi Docs](https://docs.wompi.co)
- [Render.com Docs](https://render.com/docs)

### **Soporte:**
- **Wompi**: soporte@wompi.co
- **GitHub**: [GitHub Support](https://support.github.com)
- **Render**: [Render Support](https://render.com/support)

### **Tutoriales:**
- [Cómo usar GitHub Pages](https://www.youtube.com/results?search_query=github+pages+tutorial)
- [Cómo usar Render](https://www.youtube.com/results?search_query=render+deployment+tutorial)

---

## 🎓 Próximos Pasos

1. **Hoy:**
   - [ ] Probar en localhost
   - [ ] Hacer un pago de prueba
   - [ ] Verificar que todo funcione

2. **Esta semana:**
   - [ ] Crear repositorio en GitHub
   - [ ] Desplegar en GitHub Pages
   - [ ] Probar en la URL pública

3. **Próximo mes:**
   - [ ] Considerar dominio personalizado
   - [ ] Configurar webhooks si es necesario
   - [ ] Cambiar a modo producción en Wompi

---

## ✨ Resumen Final

### **Localhost:**
```powershell
python server.py
# Abre: http://localhost:8000
```

### **GitHub Pages:**
```powershell
git init
git add .
git commit -m "Deploy"
git push
# Activa en Settings → Pages
```

### **Webhooks (Opcional):**
- Despliega en Render.com
- Configura URL en Wompi
- ¡Listo!

---

**¡Todo listo para desplegar!** 🚀

Si tienes dudas, revisa esta guía paso a paso.
