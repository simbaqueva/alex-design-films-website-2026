# Configuración de URLs Limpias - Alex Design Films

Este sitio web ahora utiliza **URLs limpias** (sin el símbolo `#`) gracias a la **History API** de HTML5.

## URLs Anteriores vs Nuevas

- ❌ Antes: `http://localhost:8000/#tienda`
- ✅ Ahora: `http://localhost:8000/tienda`

## Cómo Ejecutar el Sitio

### Opción 1: Servidor Python (Recomendado para desarrollo)

Usa el servidor personalizado incluido que soporta URLs limpias:

```bash
python server.py
```

Luego abre tu navegador en `http://localhost:8000`

### Opción 2: Node.js con http-server

Instala http-server globalmente:

```bash
npm install -g http-server
```

Ejecuta con soporte para SPA:

```bash
http-server -p 8000 --proxy http://localhost:8000?
```

### Opción 3: PHP Built-in Server

```bash
php -S localhost:8000
```

Nota: Necesitarás configurar rewrites manualmente para PHP.

### Opción 4: Live Server (VS Code Extension)

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

Nota: Live Server automáticamente maneja las URLs limpias para SPAs.

## Configuración para Producción

### Apache (.htaccess)

El archivo `.htaccess` ya está incluido en el proyecto. Asegúrate de que `mod_rewrite` esté habilitado:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### Nginx

Agrega esto a tu configuración de Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Firebase Hosting

El archivo `firebase.json` ya está incluido con la configuración correcta.

### Vercel

Crea un archivo `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify

Crea un archivo `_redirects` en la raíz:

```
/*    /index.html   200
```

## Rutas Disponibles

- `/` o `/inicio` - Página de inicio
- `/servicios` - Servicios
- `/agentes-ia` - Agentes IA
- `/tienda` - Tienda
- `/contacto` - Contacto
- `/carrito` - Carrito de compras

## Solución de Problemas

### Las rutas no funcionan (404)

Si obtienes errores 404 al navegar directamente a una URL:

1. Asegúrate de estar usando uno de los servidores recomendados arriba
2. Verifica que la configuración de rewrites esté activa
3. Para desarrollo, usa `python server.py` que ya incluye todo lo necesario

### Los enlaces no funcionan

Si los enlaces no navegan correctamente:

1. Verifica que todos los enlaces usen el formato `/ruta` en lugar de `#ruta`
2. Revisa la consola del navegador para errores de JavaScript
3. Asegúrate de que el archivo `router.js` se haya actualizado correctamente

## Notas Técnicas

- El router ahora usa `window.history.pushState()` en lugar de `window.location.hash`
- Los botones atrás/adelante del navegador funcionan correctamente
- Las URLs son más amigables para SEO
- Puedes compartir URLs directas a cualquier página del sitio
