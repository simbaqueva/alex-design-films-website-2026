# 🚀 Wompi - Modo Sandbox (Desarrollo Local)

## ✅ Configuración Actual

Tu sitio web está configurado para usar **Wompi en modo SANDBOX** (pruebas), lo que significa que:

- ✅ **Funciona directamente con localhost** (no necesitas ngrok)
- ✅ **No se realizan cargos reales** a las tarjetas
- ✅ **Puedes probar todos los flujos de pago** sin riesgo
- ✅ **Usa la API completa de Wompi** (no es una simulación)

## 🎯 Cómo Probar Pagos

### 1. Inicia el Servidor Local

```bash
.\INICIAR.bat
```

Esto abrirá tu sitio en: `http://localhost:8000`

### 2. Navega a la Tienda

Ve a: `http://localhost:8000/tienda`

### 3. Agrega Productos al Carrito

Selecciona productos y agrégalos al carrito.

### 4. Procede al Pago

Haz clic en "Proceder al Pago" en el carrito.

### 5. Usa Tarjetas de Prueba

Wompi proporciona tarjetas de prueba para diferentes escenarios:

#### ✅ Pago Exitoso
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/25)
CVC: Cualquier 3 dígitos (ej: 123)
Nombre: Cualquier nombre
```

#### ❌ Pago Rechazado
```
Número: 4000 0000 0000 0002
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

#### ⏳ Pago Pendiente
```
Número: 4000 0000 0000 0341
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

## 🔧 Configuración Técnica

### Llave Pública de Sandbox
```
pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh
```

Esta llave está configurada en: `assets/js/config/wompi-config.js`

### Modo Sandbox Activado
```javascript
SANDBOX_MODE: true
```

### Métodos de Pago Habilitados
- ✅ Tarjetas de crédito/débito
- ✅ Nequi (modo prueba)
- ✅ PSE (modo prueba)

## 🌐 ¿Por Qué Funciona con Localhost?

Wompi tiene dos modos de operación:

### Modo Sandbox (Actual)
- Acepta URLs de localhost
- No requiere HTTPS
- Ideal para desarrollo
- Usa llaves `pub_test_*`

### Modo Producción (Futuro)
- Requiere URL pública HTTPS
- Procesa pagos reales
- Usa llaves `pub_prod_*`

## 📊 Verificar Transacciones de Prueba

1. Ve al dashboard de Wompi: https://comercios.wompi.co/
2. Inicia sesión con tu cuenta
3. Ve a "Transacciones"
4. Filtra por "Sandbox" o "Pruebas"
5. Verás todas las transacciones de prueba realizadas

## 🔄 Flujo Completo de Pago

```
1. Usuario agrega productos al carrito
   ↓
2. Usuario hace clic en "Proceder al Pago"
   ↓
3. Se carga el formulario de Wompi
   ↓
4. Usuario ingresa datos de tarjeta de prueba
   ↓
5. Wompi procesa el pago (modo sandbox)
   ↓
6. Usuario es redirigido a /confirmacion
   ↓
7. Se muestra el estado del pago
```

## 🚨 Importante

### ✅ En Desarrollo (Ahora)
- Usa `http://localhost:8000`
- Modo sandbox activado
- Tarjetas de prueba
- Sin cargos reales

### 🔐 En Producción (Futuro)
Para pasar a producción necesitarás:

1. **Cambiar a modo producción**
   ```javascript
   SANDBOX_MODE: false
   ```

2. **Usar llave de producción**
   ```javascript
   PUBLIC_KEY_PROD: 'pub_prod_TU_LLAVE_REAL'
   ```

3. **Desplegar en servidor con HTTPS**
   - GitHub Pages
   - Netlify
   - Vercel
   - Servidor propio con SSL

4. **Configurar webhook (opcional)**
   - Para recibir notificaciones de pago
   - Requiere endpoint público HTTPS

## 🎨 Personalización

Puedes personalizar la configuración en:
```
assets/js/config/wompi-config.js
```

### Opciones disponibles:
- Métodos de pago habilitados
- Moneda (COP, USD)
- URL de redirección
- Tiempo de expiración del checkout
- Modo debug

## 📚 Recursos Adicionales

- **Documentación oficial**: https://docs.wompi.co/
- **Dashboard de comercio**: https://comercios.wompi.co/
- **Tarjetas de prueba**: https://docs.wompi.co/docs/en/tarjetas-de-prueba
- **API Reference**: https://docs.wompi.co/reference

## ❓ Preguntas Frecuentes

### ¿Necesito ngrok?
**No.** Wompi en modo sandbox funciona perfectamente con localhost.

### ¿Los pagos son reales?
**No.** En modo sandbox, todos los pagos son simulados. No se realizan cargos reales.

### ¿Puedo probar Nequi y PSE?
**Sí.** Wompi proporciona simuladores para todos los métodos de pago en modo sandbox.

### ¿Cuándo debo pasar a producción?
Cuando tu sitio esté listo para recibir pagos reales y esté desplegado en un servidor con HTTPS.

### ¿Necesito webhook en desarrollo?
**No.** Los webhooks son opcionales y principalmente útiles en producción para automatizar procesos.

## 🎉 ¡Listo!

Tu integración de Wompi está completamente funcional en modo desarrollo. Puedes probar todos los flujos de pago directamente desde localhost sin necesidad de herramientas adicionales.
