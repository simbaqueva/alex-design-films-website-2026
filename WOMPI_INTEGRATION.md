# 💳 Integración de Wompi - Alex Design Films

## 🎯 Descripción

Esta integración permite procesar pagos de forma **100% segura** usando Wompi, sin manejar datos sensibles de tarjetas en tu servidor.

### ✅ Ventajas de esta implementación:

- **Sin riesgos legales**: No procesas ni almacenas datos de tarjetas (PCI-DSS compliant)
- **Seguro por defecto**: Todo el proceso de pago ocurre en el widget de Wompi
- **Fácil de usar**: Solo necesitas tu llave pública de Wompi
- **Sin backend complejo**: No requiere servidor para procesar pagos

---

## 🚀 Configuración Rápida

### 1. Obtener tus llaves de Wompi

1. Regístrate en [Wompi.co](https://comercios.wompi.co/register)
2. Ve a **Configuración → API Keys**
3. Copia tu **Llave Pública** (comienza con `pub_`)

### 2. Configurar la llave en el código

Edita el archivo: `assets/js/core/router.js`

Busca la línea (aproximadamente línea 447):

```javascript
publicKey: 'pub_test_G4gWlwUAT4z8bHCHlOohNKxsKvG1Huq7', // Llave de prueba de Wompi
```

Reemplázala con tu llave:

```javascript
publicKey: 'pub_prod_TU_LLAVE_PUBLICA_AQUI', // Tu llave de producción
sandbox: false, // Cambiar a false para producción
```

### 3. ¡Listo!

Ya puedes procesar pagos reales. El flujo es:

1. Usuario agrega productos al carrito
2. Usuario hace clic en "Proceder al Pago"
3. Se abre el widget de Wompi (modal seguro)
4. Usuario completa el pago en Wompi
5. Wompi procesa el pago
6. Usuario es redirigido a página de confirmación

---

## 🔧 Configuración Avanzada

### Personalizar datos del cliente

En `router.js`, método `handleCheckoutClick()`, puedes personalizar:

```javascript
const orderData = {
    total: summary.total,
    subtotal: summary.subtotal,
    tax: summary.tax,
    items: window.cartManager.cart,
    itemCount: summary.itemCount,
    // Personaliza estos datos:
    customerEmail: 'cliente@example.com',      // Email del cliente
    customerName: 'Cliente Alex Design Films', // Nombre del cliente
    customerPhone: '3001234567'                // Teléfono del cliente
};
```

**Recomendación**: Crea un formulario antes del checkout para pedir estos datos.

### Cambiar URL de redirección

Por defecto, redirige a `/confirmacion`. Para cambiar:

```javascript
redirectUrl: window.location.origin + '/tu-pagina-personalizada'
```

### Modo Sandbox vs Producción

**Modo Sandbox (Pruebas)**:
```javascript
sandbox: true,
publicKey: 'pub_test_...'
```

**Modo Producción**:
```javascript
sandbox: false,
publicKey: 'pub_prod_...'
```

---

## 🧪 Probar la Integración

### Tarjetas de prueba de Wompi:

**Tarjeta Aprobada**:
- Número: `4242 4242 4242 4242`
- CVV: Cualquier 3 dígitos
- Fecha: Cualquier fecha futura

**Tarjeta Rechazada**:
- Número: `4111 1111 1111 1111`
- CVV: Cualquier 3 dígitos
- Fecha: Cualquier fecha futura

---

## 📊 Verificar Transacciones

1. Ingresa a tu panel de Wompi: [comercios.wompi.co](https://comercios.wompi.co)
2. Ve a **Transacciones**
3. Verás todas las transacciones procesadas

---

## 🔒 Seguridad

### ¿Qué datos NO se almacenan en tu servidor?

- ❌ Números de tarjeta
- ❌ CVV
- ❌ Fechas de expiración
- ❌ Datos bancarios

### ¿Qué datos SÍ se almacenan?

- ✅ Referencia de la transacción (en localStorage del navegador)
- ✅ Estado del pago (aprobado/rechazado/pendiente)
- ✅ Monto de la compra
- ✅ Productos comprados

---

## 🛠️ Archivos Modificados

1. **`assets/js/modules/wompi-integration.js`** - Módulo principal de Wompi
2. **`assets/js/core/router.js`** - Integración con el botón de pago
3. **`assets/components/cart-page.html`** - Botón "Proceder al Pago"
4. **`assets/css/components/cart-page.css`** - Estilos del botón

---

## 🐛 Solución de Problemas

### El widget no se abre

1. Verifica que tu llave pública sea correcta
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que tengas conexión a internet

### El pago no se procesa

1. Verifica que estés usando una tarjeta válida
2. En modo sandbox, usa las tarjetas de prueba
3. Verifica que tu cuenta de Wompi esté activa

### Error de CORS

Wompi maneja todo desde su dominio, no deberías tener problemas de CORS.

---

## 📞 Soporte

- **Documentación Wompi**: [docs.wompi.co](https://docs.wompi.co)
- **Soporte Wompi**: soporte@wompi.co
- **WhatsApp Wompi**: +57 300 123 4567

---

## 🎓 Recursos Adicionales

- [Documentación oficial de Wompi](https://docs.wompi.co)
- [Widget Checkout Guide](https://docs.wompi.co/docs/widget-checkout)
- [API Reference](https://docs.wompi.co/reference)

---

## ✨ Próximos Pasos

1. **Webhooks** (opcional): Recibe notificaciones automáticas de pagos
2. **Pagos recurrentes**: Configura suscripciones
3. **Múltiples métodos de pago**: PSE, Nequi, Daviplata, etc.

---

**¡Listo!** Tu integración de Wompi está completa y lista para procesar pagos de forma segura. 🎉
