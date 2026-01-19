# 🚀 Guía de Pruebas Wompi en GitHub Pages

## 📋 Resumen del Deployment

Se ha configurado correctamente el sandbox de Wompi para funcionar en GitHub Pages con las siguientes mejoras:

### ✅ Cambios Realizados

1. **Configuración Automática de URLs**
   - Detección automática de GitHub Pages vs localhost
   - Base path configurado para GitHub Pages: `/alex-design-films-website-2026`
   - URL de redirección dinámica según el entorno

2. **Página de Pruebas Específica**
   - Archivo: `test-wompi-github-pages.html`
   - Interfaz completa para testing del sandbox
   - Datos de prueba integrados

3. **Compatibilidad Mantenida**
   - Funciona perfectamente en localhost para desarrollo
   - Funciona en GitHub Pages para producción de pruebas
   - Mismo código para ambos entornos

## 🌐 URLs de Acceso

### GitHub Pages (Producción de Pruebas)
```
https://simbaqueva.github.io/alex-design-films-website-2026/
```

### Página de Pruebas Wompi
```
https://simbaqueva.github.io/alex-design-films-website-2026/test-wompi-github-pages.html
```

### Localhost (Desarrollo)
```
http://localhost:8000/test-wompi-github-pages.html
```

## 🧪 Métodos de Pago Habilitados

- **💳 Tarjetas de crédito/débito**
- **📱 Nequi**
- **🏦 PSE (Transferencias bancarias)**
- **🔄 Transferencia Bancolombia**
- **📲 QR Bancolombia**

## 📝 Datos de Prueba (Sandbox)

### Tarjeta de Crédito
```
Número: 4242424242424242
CVV: 123
Fecha: 12/25
Nombre: CUALQUIER NOMBRE
```

### Nequi
```
Número: 3001234567
```

### PSE
```
Banco: Cualquier banco disponible
Tipo: Persona Natural
```

## 🔧 Configuración Técnica

### Modo Sandbox
- `SANDBOX_MODE: true` ✅
- Llave pública de prueba configurada
- URLs de redirección automáticas

### Detección de Entorno
```javascript
// En assets/js/config/wompi-config.js
REDIRECT_URL: (() => {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/alex-design-films-website-2026' : '';
    return window.location.origin + basePath + '/#confirmacion';
})()
```

## 🚀 Pasos para Probar

1. **Acceder a la página de pruebas**:
   - Visita: `test-wompi-github-pages.html`
   - Espera a que cargue la configuración

2. **Verificar configuración**:
   - Revisa que esté en modo sandbox
   - Confirma la URL de redirección
   - Verifica métodos de pago habilitados

3. **Probar pagos**:
   - Usa los botones de prueba rápida
   - O configura monto y descripción personalizados
   - Sigue el flujo de Wompi sandbox

4. **Validar redirección**:
   - Después del pago, debe redirigir a `/#confirmacion`
   - Verifica que los datos del pago se muestren

## 🔄 Workflow Automático

El deployment a GitHub Pages es automático:

1. **Trigger**: Push a la rama `main`
2. **Action**: `.github/workflows/deploy.yml`
3. **Resultado**: Sitio desplegado en GitHub Pages

## 🛠️ Solución de Problemas

### Si no carga Wompi:
1. Verifica conexión a internet
2. Revisa consola del navegador
3. Confirma que el script de Wompi cargue

### Si la redirección falla:
1. Verifica la URL base en la configuración
2. Confirma que el hash `#confirmacion` esté presente
3. Revisa logs de Wompi en consola

### Si el pago se rechaza:
1. Usa datos de prueba válidos
2. Verifica monto mínimo (1000 COP)
3. Confirma modo sandbox activado

## 📊 Monitoreo

### Logs en Consola
- Activar: `WOMPI_CONFIG.DEBUG_MODE = true`
- Filtro: `[WOMPI]` en consola del navegador

### Estado de Transacciones
- Los pagos en sandbox aparecen en el dashboard de Wompi
- Referencias comienzan con `TEST_`
- Estados posibles: `PENDING`, `APPROVED`, `DECLINED`, `ERROR`

## 🎯 Próximos Pasos

1. **Pruebas Completas**: Realizar pruebas de todos los métodos de pago
2. **Validación UX**: Probar en diferentes dispositivos y navegadores
3. **Documentación**: Actualizar documentación para usuarios finales
4. **Producción**: Cuando esté listo, cambiar `SANDBOX_MODE: false`

## 📞 Soporte

- **Dashboard Wompi**: [sandbox.wompi.co](https://sandbox.wompi.co)
- **Documentación**: [docs.wompi.co](https://docs.wompi.co)
- **Repositorio**: [GitHub Repository](https://github.com/simbaqueva/alex-design-films-website-2026)

---

**✅ Estado**: Configuración completada y desplegada exitosamente
**🚀 Listo para**: Pruebas del sandbox de Wompi en GitHub Pages
