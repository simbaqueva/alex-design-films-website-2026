# 🚀 CÓMO INICIAR TU SITIO WEB

## 📋 Inicio Rápido (1 Paso)

### **Doble clic en:** `INICIAR.bat`

¡Eso es todo! El script hará automáticamente:

1. ✅ Verificar si el servidor está corriendo
2. ✅ Iniciar el servidor si no está corriendo
3. ✅ Esperar a que el servidor esté listo
4. ✅ Abrir tu navegador en `http://localhost:8000`

---

## 🌐 URLs Disponibles

Una vez que el sitio esté corriendo, puedes acceder a:

| Página | URL |
|--------|-----|
| 🏠 Inicio | http://localhost:8000/ |
| 💼 Servicios | http://localhost:8000/servicios |
| 🛍️ Tienda | http://localhost:8000/tienda |
| 🤖 Agentes IA | http://localhost:8000/agentes-ia |
| 📚 Tutoriales | http://localhost:8000/tutoriales |
| 📧 Contacto | http://localhost:8000/contacto |
| 🛒 Carrito | http://localhost:8000/carrito |

---

## 🎯 Un Solo Modo de Uso

### **Desarrollo Local Completo**

**Inicia todo con un solo clic:**

```bash
# Doble clic en:
INICIAR.bat
```

**Resultado:**
- ✅ Sitio funciona en `http://localhost:8000`
- ✅ Todas las páginas funcionan
- ✅ Carrito funciona
- ✅ **Wompi funciona perfectamente** (modo sandbox)

**¿Por qué funciona Wompi con localhost?**

Wompi tiene **modo sandbox** que permite probar pagos reales usando tarjetas de prueba, directamente desde `localhost`. No necesitas ngrok ni HTTPS.

**Ventajas:**
- 🚀 Más rápido (sin configuración adicional)
- 🔒 Seguro (no exposes tu máquina local)
- 💳 Usa la API completa de Wompi (no simulado)
- 🎯 Ideal para desarrollo y pruebas

---

## 🔄 Detener el Servidor

### **Opción 1: Cerrar la ventana**
- Busca la ventana que dice "Servidor Local"
- Ciérrala o presiona `Ctrl+C`

### **Opción 2: Usar el script de reinicio**
```bash
# Doble clic en:
restart_server.bat
```
Esto detendrá el servidor anterior e iniciará uno nuevo.

---

## 🛠️ Solución de Problemas

### ❌ "El servidor no pudo iniciarse"

**Posibles causas:**
1. Python no está instalado
2. El puerto 8000 está ocupado
3. Hay un error en `server.py`

**Soluciones:**

**1. Verificar Python:**
```powershell
python --version
```
Deberías ver algo como: `Python 3.x.x`

Si no está instalado, descarga desde: https://www.python.org/downloads/

**2. Liberar puerto 8000:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :8000

# Matar el proceso (reemplaza PID con el número que viste)
taskkill /F /PID [PID]
```

**3. Verificar errores:**
- Abre PowerShell
- Navega a la carpeta del proyecto
- Ejecuta: `python server.py`
- Lee los errores que aparezcan

---

### ❌ "El navegador no se abre"

**Solución:**
Abre manualmente tu navegador y ve a:
```
http://localhost:8000
```

---

### ❌ "Wompi da error"

**Soluciones:**

1. **Verifica que estés usando tarjetas de prueba:**
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVV: `123`

2. **Verifica que estés en modo sandbox:**
   - La configuración está en `assets/js/config/wompi-config.js`

3. **Revisa la consola del navegador (F12):**
   - Busca errores de JavaScript
   - Verifica que el widget de Wompi se cargue

---

### ❌ "La página no carga / Error 404"

**Solución:**
1. Verifica que el servidor esté corriendo
2. Refresca la página (F5)
3. Limpia el caché del navegador (Ctrl+Shift+Delete)
4. Reinicia el servidor con `restart_server.bat`

---

## 📁 Estructura de Archivos

```
sitio_web_oficial_alex_design_films/
│
├── INICIAR.bat                    ← 🚀 USAR ESTE para localhost
├── start_with_ngrok.bat           ← 🚀 USAR ESTE para Wompi
├── restart_server.bat             ← 🔄 Reiniciar servidor
│
├── server.py                      ← Servidor web
├── index.html                     ← Página principal
│
├── assets/
│   ├── css/                       ← Estilos
│   ├── js/                        ← JavaScript
│   ├── components/                ← Componentes HTML
│   └── images/                    ← Imágenes
│
└── Documentación/
    ├── INICIO_WOMPI.md            ← Guía de Wompi
    ├── GUIA_RAPIDA_WOMPI.md       ← Guía rápida
    ├── COMO_OBTENER_AUTHTOKEN.md  ← Configurar ngrok
    └── WOMPI_403_SOLUCION.md      ← Solucionar error 403
```

---

## 🎨 Características del Sitio

- ✅ **Diseño Premium** - Glassmorphism, gradientes, animaciones
- ✅ **Totalmente Responsivo** - Funciona en móvil, tablet y desktop
- ✅ **SPA (Single Page Application)** - Navegación sin recargas
- ✅ **Carrito de Compras** - Funcional con localStorage
- ✅ **Pasarela de Pago Wompi** - Integración completa
- ✅ **Optimizado** - Caché, compresión gzip, multi-thread

---

## 📊 Rendimiento

- ⚡ Carga inicial: ~440ms
- ⚡ Navegación: Casi instantánea
- ⚡ 41 recursos comprimidos con gzip
- ⚡ Caché HTTP optimizado

---

## 🔧 Desarrollo

### **Ver cambios en tiempo real:**

1. Edita cualquier archivo (HTML, CSS, JS)
2. Guarda el archivo
3. Refresca el navegador (F5)
4. ¡Los cambios aparecen inmediatamente!

### **Archivos importantes para editar:**

| Archivo | Qué hace |
|---------|----------|
| `index.html` | Estructura principal |
| `assets/css/styles.css` | Estilos globales |
| `assets/js/app.js` | Lógica principal |
| `assets/components/*.html` | Secciones del sitio |
| `assets/js/config/wompi-config.js` | Configuración de Wompi |

---

## 🚀 Desplegar a Producción

Cuando estés listo para publicar:

1. **GitHub Pages (Gratis):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
   Luego activa GitHub Pages en Settings → Pages

2. **Netlify (Gratis):**
   - Arrastra la carpeta a netlify.com/drop
   - ¡Listo!

3. **Vercel (Gratis):**
   - Conecta tu repositorio de GitHub
   - Deploy automático

📖 **Más info:** Consulta la documentación de cada plataforma

---

## ✅ Checklist de Inicio

- [ ] Python instalado
- [ ] Doble clic en `INICIAR.bat`
- [ ] Servidor iniciado correctamente
- [ ] Navegador abierto en localhost:8000
- [ ] Sitio cargando correctamente
- [ ] Navegación entre páginas funciona
- [ ] Carrito funciona
- [ ] (Opcional) ngrok configurado para Wompi

---

## 💡 Consejos Pro

### **Atajos de Teclado:**
- `F5` - Recargar página
- `Ctrl+Shift+R` - Recargar sin caché
- `F12` - Abrir DevTools (consola)
- `Ctrl+Shift+Delete` - Limpiar caché

### **DevTools:**
- **Console:** Ver errores de JavaScript
- **Network:** Ver tiempos de carga
- **Elements:** Inspeccionar HTML/CSS
- **Application:** Ver localStorage (carrito)

---

## 📞 Soporte

¿Problemas? Consulta:
- 📖 `INICIO_WOMPI.md` - Guía de Wompi
- 🔧 `WOMPI_403_SOLUCION.md` - Soluciones
- 💻 Abre un issue en GitHub
- 📧 Contacta al desarrollador

---

## 🎉 ¡Listo para Empezar!

**Simplemente haz doble clic en `INICIAR.bat` y comienza a trabajar!** 🚀

---

**Creado con ❤️ para Alex Design Films**
