# Integración de Pagos Bold - Guía de Configuración

## 📋 Descripción

Este proyecto incluye una integración completa con la API de pagos de Bold para procesar pagos en línea directamente desde la página del carrito de compras.

## ✨ Características

- ✅ **Botón de pago integrado**: Aparece automáticamente cuando hay productos en el carrito
- ✅ **Modo Embedded**: La pasarela de pagos se abre sin salir del sitio web
- ✅ **Actualización dinámica**: El botón se actualiza automáticamente cuando cambia el carrito
- ✅ **Responsive**: Funciona perfectamente en todos los dispositivos
- ✅ **Seguro**: Implementa hash de integridad para validar transacciones

## 🔧 Configuración

### 1. Obtener las Llaves de Integración de Bold

1. Accede a tu cuenta de Bold en [https://bold.co](https://bold.co)
2. Ve a **Configuración** → **Integraciones**
3. Obtén tus llaves:
   - **API Key (Llave de Identidad)**: Llave pública para identificar tu comercio
   - **Secret Key (Llave Secreta)**: Llave privada para generar el hash de integridad

⚠️ **IMPORTANTE**: La Secret Key NUNCA debe exponerse en el frontend. Solo debe usarse en el backend.

### 2. Configurar la API Key en el Código

Edita el archivo `assets/js/core/router.js` y busca la función `initializeBoldPayment()`:

```javascript
async initializeBoldPayment() {
    try {
        const { initializeBoldPayment, getBoldPaymentIntegration } = await import('../modules/bold-payment.js');
        
        // REEMPLAZA 'YOUR_BOLD_API_KEY' con tu API Key real
        const apiKey = 'TU_API_KEY_AQUI';
        
        await initializeBoldPayment(apiKey);
        // ...
    }
}
```

### 3. Configurar el Backend para el Hash de Integridad

⚠️ **CRÍTICO**: El hash de integridad debe generarse en el backend por seguridad.

#### Ejemplo de Endpoint Backend (Node.js/Express)

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

app.post('/api/generate-payment-hash', (req, res) => {
    const { orderId, currency, amount } = req.body;
    const secretKey = process.env.BOLD_SECRET_KEY; // Desde variables de entorno
    
    // Generar hash SHA256
    const dataToHash = `${orderId}${currency}${amount}${secretKey}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    res.json({ hash });
});
```

#### Actualizar el Módulo Bold Payment

Edita `assets/js/modules/bold-payment.js` y modifica la función `generateIntegrityHash()`:

```javascript
async generateIntegrityHash(orderId, currency, amount) {
    try {
        const response = await fetch('/api/generate-payment-hash', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId, currency, amount })
        });
        
        const data = await response.json();
        return data.hash;
    } catch (error) {
        console.error('Error generating integrity hash:', error);
        throw error;
    }
}
```

### 4. Configurar URLs de Redirección

En el archivo `assets/js/modules/bold-payment.js`, puedes personalizar las URLs de redirección:

```javascript
renderBoldButton({
    // ...
    redirectionUrl: window.location.origin + '/carrito?payment=success',
    originUrl: window.location.origin + '/carrito?payment=abandoned'
});
```

- **redirectionUrl**: URL a donde se redirige después de un pago exitoso
- **originUrl**: URL a donde se redirige si el usuario abandona el pago

## 🚀 Uso

### Flujo de Usuario

1. El usuario agrega productos al carrito
2. Navega a la página del carrito (`/carrito`)
3. Ve el resumen de su compra y el botón de pago de Bold
4. Hace clic en el botón de Bold
5. Se abre la pasarela de pagos en modo embedded (sin salir del sitio)
6. Completa el pago
7. Es redirigido a la página de confirmación

### Comportamiento del Botón

- **Sin productos**: El botón NO se muestra
- **Con productos**: El botón aparece automáticamente
- **Cambios en el carrito**: El botón se actualiza con los nuevos totales
- **Carrito vaciado**: El botón desaparece

## 📊 Estructura de Datos

### Datos Enviados a Bold

```javascript
{
    orderId: "ORD-1234567890-ABC123",
    currency: "COP",
    amount: 50000, // En centavos
    description: "Compra de 3 productos - Alex Design Films",
    tax: "vat-19", // 19% IVA
    redirectionUrl: "https://tudominio.com/carrito?payment=success",
    originUrl: "https://tudominio.com/carrito?payment=abandoned"
}
```

### Datos del Carrito

```javascript
{
    items: [
        {
            id: "product-123",
            name: "Producto Ejemplo",
            price: 25000,
            quantity: 2
        }
    ],
    subtotal: 50000,
    tax: 9500,
    total: 59500,
    itemCount: 2
}
```

## 🔒 Seguridad

### Mejores Prácticas

1. ✅ **Nunca expongas la Secret Key en el frontend**
2. ✅ **Genera el hash de integridad en el backend**
3. ✅ **Usa HTTPS en producción**
4. ✅ **Valida las transacciones en el backend usando webhooks**
5. ✅ **Implementa rate limiting en tu API**

### Validación de Pagos con Webhooks

Bold enviará notificaciones a tu servidor cuando se complete un pago. Configura un endpoint para recibir estos webhooks:

```javascript
app.post('/webhooks/bold-payment', (req, res) => {
    const { orderId, status, amount } = req.body;
    
    // Validar el webhook (verificar firma, etc.)
    // Actualizar el estado del pedido en tu base de datos
    // Enviar confirmación al usuario
    
    res.status(200).send('OK');
});
```

Configura esta URL en tu panel de Bold: **Configuración** → **Webhooks**

## 🧪 Ambiente de Pruebas

Bold proporciona un ambiente de pruebas (sandbox) para testing:

1. Usa las llaves de prueba proporcionadas por Bold
2. Los pagos no serán reales
3. Puedes simular diferentes escenarios (éxito, fallo, etc.)

Más información: [https://developers.bold.co/pagos-en-linea/boton-de-pagos/ambiente-pruebas](https://developers.bold.co/pagos-en-linea/boton-de-pagos/ambiente-pruebas)

## 📱 Personalización del Botón

Puedes personalizar la apariencia del botón editando el atributo `data-bold-button`:

```javascript
boldScript.setAttribute('data-bold-button', 'dark-L'); // Opciones:
// Colores: 'dark' o 'light'
// Tamaños: 'S', 'M', 'L'
// Ejemplos: 'dark-S', 'light-M', 'dark-L'
```

## 🐛 Troubleshooting

### El botón no aparece

1. Verifica que hay productos en el carrito
2. Revisa la consola del navegador para errores
3. Confirma que la API Key está configurada correctamente
4. Verifica que el script de Bold se cargó correctamente

### Error de hash de integridad

1. Verifica que el backend está generando el hash correctamente
2. Confirma que estás usando la Secret Key correcta
3. Revisa que el formato del hash es correcto (SHA256 en hexadecimal)

### El pago no se procesa

1. Verifica que estás usando las llaves correctas (producción vs pruebas)
2. Confirma que el monto está en el formato correcto (centavos)
3. Revisa los logs de Bold en tu panel de administración

## 📚 Recursos Adicionales

- [Documentación oficial de Bold](https://developers.bold.co/pagos-en-linea)
- [Integración manual del botón](https://developers.bold.co/pagos-en-linea/boton-de-pagos/integracion-manual)
- [API de pagos en línea](https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea)
- [Consulta de transacciones](https://developers.bold.co/pagos-en-linea/consulta-de-transacciones)

## 📞 Soporte

Para soporte técnico de Bold:
- Email: soporte@bold.co
- Documentación: [https://developers.bold.co](https://developers.bold.co)
- Panel de administración: [https://bold.co](https://bold.co)

## 📝 Notas Importantes

1. **Moneda**: Por defecto está configurado para COP (Pesos Colombianos). Cambia según tu necesidad.
2. **Impuestos**: El IVA está configurado al 19% (`vat-19`). Ajusta según tu país/región.
3. **Modo Embedded**: El botón usa modo embedded para mejor UX. Puedes cambiarlo a redirect si lo prefieres.
4. **Datos del Cliente**: Puedes pre-llenar datos del cliente usando `data-customer-data` y `data-billing-address`.

## ✅ Checklist de Implementación

- [ ] Obtener API Key y Secret Key de Bold
- [ ] Configurar API Key en `router.js`
- [ ] Implementar endpoint backend para hash de integridad
- [ ] Actualizar función `generateIntegrityHash()` para usar el backend
- [ ] Configurar URLs de redirección
- [ ] Configurar webhook para validación de pagos
- [ ] Probar en ambiente de pruebas
- [ ] Validar flujo completo de pago
- [ ] Implementar manejo de errores
- [ ] Configurar monitoreo y logs
- [ ] Pasar a producción con llaves reales

---

**Última actualización**: Enero 2026
**Versión de la integración**: 1.0.0
