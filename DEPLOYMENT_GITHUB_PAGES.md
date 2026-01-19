# 🚀 Guía de Deployment a GitHub Pages

## 📋 Pasos para Desplegar

### 1. Habilitar GitHub Pages

1. Ve a tu repositorio: https://github.com/simbaqueva/alex-design-films-website-2026
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona **GitHub Actions**
5. Guarda los cambios

### 2. Hacer Push de los Cambios

Los archivos ya están configurados. Solo necesitas hacer push:

```powershell
git add .
git commit -m "chore: Configuración para GitHub Pages deployment"
git push origin main
```

### 3. Verificar el Deployment

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow "Deploy to GitHub Pages" ejecutándose
3. Espera a que termine (tarda 1-2 minutos)
4. Tu sitio estará disponible en: `https://simbaqueva.github.io/alex-design-films-website-2026/`

## 🔧 Configuración Post-Deployment

### Actualizar URL de Wompi

Una vez desplegado, actualiza la configuración de Wompi en `assets/js/modules/wompi-integration.js`:

```javascript
const wompi = initializeWompi({
    publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh', // Cambiar a producción
    sandbox: true, // Cambiar a false para producción
    redirectUrl: 'https://simbaqueva.github.io/alex-design-films-website-2026/confirmacion'
});
```

### Para Producción Real

Cuando estés listo para producción:

1. **Obtén claves de producción de Wompi**:
   - Inicia sesión en https://comercios.wompi.co/
   - Ve a Configuración → API Keys
   - Copia tu `public_key` de producción

2. **Actualiza la configuración**:
   ```javascript
   const wompi = initializeWompi({
       publicKey: 'pub_prod_TU_CLAVE_REAL',
       sandbox: false,
       redirectUrl: 'https://simbaqueva.github.io/alex-design-films-website-2026/confirmacion'
   });
   ```

3. **Configura Webhooks** (opcional):
   - En el panel de Wompi, configura la URL de webhook
   - Para GitHub Pages, necesitarás un backend separado (Netlify Functions, Vercel, etc.)

## 🌐 Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. En **Settings → Pages**, agrega tu dominio en **Custom domain**
2. Configura los DNS de tu dominio:
   ```
   A record: 185.199.108.153
   A record: 185.199.109.153
   A record: 185.199.110.153
   A record: 185.199.111.153
   ```
3. Espera a que se active el certificado SSL (automático)

## 📊 Estructura de Archivos

GitHub Pages servirá estos archivos:

```
/
├── index.html              (Página principal)
├── assets/
│   ├── css/               (Estilos)
│   ├── js/                (JavaScript)
│   ├── images/            (Imágenes)
│   └── components/        (Componentes HTML)
├── .nojekyll              (Desactiva Jekyll)
└── .github/
    └── workflows/
        └── deploy.yml     (Workflow de deployment)
```

## ⚠️ Limitaciones de GitHub Pages

1. **No soporta server.py**: GitHub Pages solo sirve archivos estáticos
2. **No hay proxy de Wompi**: El proxy que creamos solo funciona en localhost
3. **Solución**: El Widget de Wompi funciona directamente desde HTTPS sin necesidad de proxy

## ✅ Ventajas de GitHub Pages

1. ✅ **HTTPS gratuito** - Wompi funcionará perfectamente
2. ✅ **URL permanente** - No cambia como localhost.run
3. ✅ **Deployment automático** - Cada push actualiza el sitio
4. ✅ **CDN global** - Rápido en todo el mundo
5. ✅ **100% gratuito** - Sin costos

## 🧪 Probar Después del Deployment

1. Abre: `https://simbaqueva.github.io/alex-design-films-website-2026/`
2. Navega a la tienda
3. Agrega productos al carrito
4. Ve a pago
5. Prueba con tarjeta de sandbox: `4242 4242 4242 4242`

## 🐛 Troubleshooting

### El sitio no carga

- Verifica que GitHub Actions haya terminado
- Espera 5 minutos después del deployment
- Limpia la caché del navegador (Ctrl + Shift + R)

### Error 404 en rutas

- Asegúrate de que `.nojekyll` exista
- Verifica que el SPA routing esté configurado en `index.html`

### Wompi no funciona

- Verifica que la URL sea HTTPS (no HTTP)
- Actualiza `redirectUrl` en la configuración de Wompi
- Revisa la consola del navegador para errores

## 📚 Recursos

- [GitHub Pages Docs](https://docs.github.com/pages)
- [Wompi Docs](https://docs.wompi.co/)
- [GitHub Actions](https://docs.github.com/actions)

---

**¡Listo para producción!** 🎉
