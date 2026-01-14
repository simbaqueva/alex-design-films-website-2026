# ✅ CHECKLIST DE CONFIGURACIÓN
## Bold Payment Integration

Usa este checklist para asegurarte de que todo está configurado correctamente.

---

## 📦 FASE 1: Instalación

### Node.js y npm
- [ ] Node.js instalado (versión 14+)
  ```powershell
  node --version
  ```
- [ ] npm instalado
  ```powershell
  npm --version
  ```

### Dependencias del Backend
- [ ] Navegado a carpeta backend
  ```powershell
  cd backend
  ```
- [ ] Dependencias instaladas
  ```powershell
  npm install
  ```
- [ ] Sin errores en la instalación

---

## 🔑 FASE 2: Credenciales

### Obtener de Bold.co
- [ ] Cuenta creada en Bold.co
- [ ] Acceso a panel de administración
- [ ] API Key obtenida (pk_test_...)
- [ ] Secret Key obtenida (sk_test_...)

### Configurar Backend
- [ ] Archivo `.env` creado (desde `.env.example`)
- [ ] `BOLD_API_KEY` configurada en `.env`
- [ ] `BOLD_SECRET_KEY` configurada en `.env`
- [ ] `FRONTEND_URL` configurada correctamente
- [ ] Archivo `.env` NO está en Git

### Configurar Frontend
- [ ] Archivo `router.js` editado
- [ ] API Key configurada (línea ~390)
- [ ] API Key coincide con la de `.env`

---

## 🚀 FASE 3: Inicio

### Backend
- [ ] Servidor backend iniciado
  ```powershell
  cd backend
  npm run dev
  ```
- [ ] Sin errores en consola
- [ ] Mensaje de inicio visible
- [ ] Puerto 3001 escuchando

### Verificación Backend
- [ ] Health check funciona
  ```
  http://localhost:3001/health
  ```
- [ ] Respuesta JSON con status: ok
- [ ] No hay warnings de configuración

### Frontend
- [ ] Servidor frontend iniciado
  ```powershell
  python -m http.server 5500
  # O Live Server
  ```
- [ ] Sitio accesible en localhost:5500
- [ ] Sin errores 404 en consola

---

## 🧪 FASE 4: Pruebas

### Prueba de Hash
- [ ] Endpoint de hash responde
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3001/api/bold/generate-hash" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"orderId":"TEST","currency":"COP","amount":50000}'
  ```
- [ ] Respuesta contiene `success: true`
- [ ] Respuesta contiene `hash`

### Prueba de Carrito
- [ ] Productos agregados al carrito
- [ ] Navegado a /carrito
- [ ] Botón de Bold visible
- [ ] Botón tiene estilo correcto

### Prueba de Consola
Abre DevTools (F12) y verifica:
- [ ] ✅ "Bold payment script loaded"
- [ ] ✅ "Hash de integridad generado correctamente"
- [ ] ✅ "Bold payment button created"
- [ ] ❌ Sin errores en rojo

### Prueba de Pago
- [ ] Click en botón de Bold
- [ ] Pasarela se abre (embedded)
- [ ] Formulario de pago visible
- [ ] Datos de prueba aceptados

---

## 🔒 FASE 5: Seguridad

### Archivos Sensibles
- [ ] `.env` en `.gitignore`
- [ ] `.env` NO en repositorio
- [ ] Secret Key solo en backend
- [ ] API Key solo en frontend

### CORS
- [ ] CORS configurado correctamente
- [ ] Solo frontend permitido
- [ ] Sin errores de CORS en consola

### Rate Limiting
- [ ] Rate limiting activo
- [ ] Límite de 100 req/15min
- [ ] Headers de rate limit visibles

---

## 📊 FASE 6: Funcionalidad

### Carrito Vacío
- [ ] Sin productos = Sin botón
- [ ] Mensaje "No has agregado ningún producto"
- [ ] Botón NO visible

### Carrito con Productos
- [ ] Con productos = Botón visible
- [ ] Botón aparece con animación
- [ ] Monto correcto mostrado
- [ ] Impuestos calculados (19%)

### Cambios en Carrito
- [ ] Agregar producto → Botón se actualiza
- [ ] Quitar producto → Botón se actualiza
- [ ] Vaciar carrito → Botón desaparece
- [ ] Cambiar cantidad → Botón se actualiza

---

## 🎨 FASE 7: UX/UI

### Diseño del Botón
- [ ] Botón estilo "dark-L"
- [ ] Tamaño apropiado
- [ ] Colores correctos
- [ ] Responsive en móvil

### Animaciones
- [ ] Botón aparece con fade-in
- [ ] Botón desaparece con fade-out
- [ ] Transiciones suaves
- [ ] Sin glitches visuales

### Mensajes
- [ ] Errores mostrados al usuario
- [ ] Mensajes claros y útiles
- [ ] Sin errores técnicos expuestos

---

## 📝 FASE 8: Documentación

### Archivos de Documentación
- [ ] `GUIA_INSTALACION.md` leída
- [ ] `INICIO_RAPIDO.md` consultada
- [ ] `BOLD_PAYMENT_INTEGRATION.md` revisada
- [ ] Este checklist completado

### Comprensión
- [ ] Entiendo el flujo de pago
- [ ] Entiendo la seguridad
- [ ] Sé cómo debuggear
- [ ] Sé cómo pasar a producción

---

## 🚦 FASE 9: Pre-Producción

### Ambiente de Pruebas
- [ ] Todas las pruebas pasadas
- [ ] Flujo completo funcional
- [ ] Sin errores conocidos
- [ ] Performance aceptable

### Preparación para Producción
- [ ] Credenciales de producción obtenidas
- [ ] Plan de migración definido
- [ ] Backup de configuración
- [ ] Rollback plan preparado

---

## 🎯 FASE 10: Producción

### Configuración de Producción
- [ ] Credenciales cambiadas a live
- [ ] `NODE_ENV=production`
- [ ] HTTPS configurado
- [ ] Dominio real configurado

### Webhooks
- [ ] Endpoint de webhook configurado
- [ ] URL registrada en Bold
- [ ] Webhook probado
- [ ] Validación de firma implementada

### Monitoreo
- [ ] Logging configurado
- [ ] Alertas configuradas
- [ ] Métricas monitoreadas
- [ ] Plan de soporte definido

---

## 📈 RESUMEN

### Progreso Total

```
[ ] 0-25%   - Instalación básica
[ ] 26-50%  - Configuración completa
[ ] 51-75%  - Pruebas exitosas
[ ] 76-100% - Listo para producción
```

### Estado Actual

Marca tu estado:
- [ ] 🔴 No iniciado
- [ ] 🟡 En progreso
- [ ] 🟢 Completado y probado
- [ ] ✅ En producción

---

## 🆘 Si algo falla...

1. **Revisa este checklist** - ¿Qué paso falta?
2. **Consulta GUIA_INSTALACION.md** - Troubleshooting detallado
3. **Revisa la consola** - ¿Qué error específico?
4. **Verifica logs del backend** - ¿Qué dice el servidor?
5. **Prueba endpoints manualmente** - ¿Responden correctamente?

---

## ✅ Completado

Fecha de completación: _______________

Configurado por: _______________

Notas adicionales:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**¡Éxito!** 🎉

Si todos los checkboxes están marcados, ¡tienes una integración completa y segura de Bold Payments!
