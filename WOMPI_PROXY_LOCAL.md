# 🔐 Guía de Integración Wompi con Proxy Local

## 📋 Descripción

Esta solución implementa un **proxy local seguro** en tu servidor Python (`server.py`) que actúa como intermediario entre tu aplicación frontend y la API de Wompi. Esto resuelve los problemas de:

- ✅ **HTTPS requerido**: El proxy hace peticiones HTTPS a Wompi desde el servidor
- ✅ **CORS**: El proxy agrega los headers necesarios para evitar errores de CORS
- ✅ **Seguridad**: No expones datos sensibles a proxies públicos de terceros
- ✅ **Desarrollo local**: Funciona perfectamente en `http://localhost:8000`

## 🏗️ Arquitectura

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Navegador     │  HTTP   │  server.py       │  HTTPS  │   Wompi API     │
│  (localhost)    │────────▶│  (Proxy Local)   │────────▶│  (sandbox)      │
│                 │◀────────│                  │◀────────│                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## 🚀 Cómo Funciona

### 1. **Servidor Proxy** (`server.py`)

El servidor Python ahora incluye:

- **Endpoint proxy**: `/api/wompi/*` 
- **Métodos soportados**: `POST`, `GET`, `OPTIONS`
- **Headers CORS**: Configurados automáticamente
- **Logging**: Muestra todas las peticiones en consola

### 2. **Cliente JavaScript** (`wompi-api-client.js`)

Un cliente que facilita las peticiones a Wompi:

```javascript
import { initializeWompiAPI } from './modules/wompi-api-client.js';

// Inicializar cliente
const wompiAPI = initializeWompiAPI({
    publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',
    sandbox: true
});

// Ejemplo: Consultar transacción
const transaction = await wompiAPI.getTransaction('12345-67890');
```

## 📝 Ejemplos de Uso

### Opción 1: Widget de Wompi (Recomendado) ✅

El widget ya funciona y es la forma más segura:

```javascript
import { initializeWompi } from './modules/wompi-integration.js';

const wompi = initializeWompi({
    publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',
    sandbox: true
});

// Abrir checkout
await wompi.openCheckout({
    total: 99.99,
    customerEmail: 'cliente@example.com',
    customerName: 'Juan Pérez',
    customerPhone: '3001234567'
});
```

### Opción 2: API Directa (Para casos avanzados)

Si necesitas hacer peticiones directas a la API:

```javascript
import { initializeWompiAPI } from './modules/wompi-api-client.js';

const wompiAPI = initializeWompiAPI();

// Consultar métodos de pago disponibles
const paymentMethods = await wompiAPI.getPaymentMethods(10000); // 100 COP

// Consultar una transacción
const transaction = await wompiAPI.getTransaction('ADF-1234567890');

// Obtener bancos PSE
const banks = await wompiAPI.getPSEBanks();
```

## 🔧 Configuración

### Claves de API

Edita las claves en tus archivos JavaScript:

**Para desarrollo (Sandbox):**
```javascript
publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh'
privateKey: 'prv_test_...' // Solo si usas API directa
```

**Para producción:**
```javascript
publicKey: 'pub_prod_TU_CLAVE_PUBLICA'
privateKey: 'prv_prod_TU_CLAVE_PRIVADA' // ⚠️ NUNCA en frontend
sandbox: false
```

### Variables de Entorno (Recomendado para producción)

Crea un archivo `config.js`:

```javascript
export const WOMPI_CONFIG = {
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_...',
    privateKey: import.meta.env.VITE_WOMPI_PRIVATE_KEY || null,
    sandbox: import.meta.env.MODE !== 'production'
};
```

## 🧪 Pruebas en Desarrollo

### 1. Iniciar el servidor

```powershell
python server.py
```

El servidor mostrará:
```
============================================================
🚀 Servidor SPA Optimizado
============================================================
📡 Puerto: 8000
🌐 URL: http://localhost:8000
============================================================
```

### 2. Abrir la aplicación

Navega a `http://localhost:8000` y ve a la página de pago.

### 3. Monitorear peticiones

En la consola del servidor verás:
```
🔄 Proxy Wompi: transactions/12345
✅ Proxy Wompi exitoso: 200
```

### 4. Tarjetas de prueba (Sandbox)

Wompi proporciona tarjetas de prueba:

| Tarjeta              | Número              | Resultado |
|----------------------|---------------------|-----------|
| Visa aprobada        | 4242 4242 4242 4242 | APPROVED  |
| Mastercard aprobada  | 5555 5555 5555 4444 | APPROVED  |
| Visa rechazada       | 4111 1111 1111 1111 | DECLINED  |

- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Fecha**: Cualquier fecha futura (ej: 12/25)

## 🔒 Seguridad

### ⚠️ Importante

1. **Nunca expongas tu clave privada** en el frontend
2. **Usa variables de entorno** para las claves en producción
3. **Valida datos** antes de enviarlos a Wompi
4. **Implementa rate limiting** en producción

### Mejoras de Seguridad para Producción

En `server.py`, agrega validaciones:

```python
def handle_wompi_proxy(self):
    # Validar origen
    origin = self.headers.get('Origin', '')
    if not origin.startswith('https://tu-dominio.com'):
        self.send_error(403, "Forbidden")
        return
    
    # Rate limiting
    # ... implementar límite de peticiones
```

## 🚀 Deployment a Producción

### GitHub Pages / Netlify / Vercel

Cuando despliegues a producción:

1. **Actualiza las URLs** en `wompi-api-client.js`:
   ```javascript
   proxyBaseUrl: 'https://tu-backend.com/api/wompi/'
   ```

2. **Despliega el backend** separadamente (Heroku, Railway, etc.)

3. **Configura CORS** en el backend para aceptar solo tu dominio

### Backend Separado (Recomendado)

Para producción, considera usar un backend dedicado:

- **Node.js + Express**
- **Python + Flask/FastAPI**
- **Cloud Functions** (Firebase, AWS Lambda)

## 📊 Endpoints del Proxy

Todos los endpoints de Wompi están disponibles a través del proxy:

| Endpoint Local                  | Wompi API Endpoint              |
|---------------------------------|---------------------------------|
| `/api/wompi/transactions`       | `POST /v1/transactions`         |
| `/api/wompi/transactions/{id}`  | `GET /v1/transactions/{id}`     |
| `/api/wompi/tokens/cards`       | `POST /v1/tokens/cards`         |
| `/api/wompi/tokens/nequi`       | `POST /v1/tokens/nequi`         |
| `/api/wompi/payment_methods`    | `GET /v1/payment_methods`       |
| `/api/wompi/pse/financial_institutions` | `GET /v1/pse/financial_institutions` |

## 🐛 Troubleshooting

### Error: "Endpoint not found"

- Verifica que la URL comience con `/api/wompi/`
- Revisa la consola del servidor para ver la ruta exacta

### Error: "CORS policy"

- Asegúrate de que el servidor esté corriendo
- Verifica que estés usando el proxy (`/api/wompi/`)

### Error: "Invalid API key"

- Verifica que estés usando la clave correcta (sandbox vs producción)
- Asegúrate de que la clave esté en el formato correcto

### El widget no se abre

- Verifica que `widget.js` se haya cargado correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que el monto sea mayor a 0

## 📚 Recursos

- [Documentación oficial de Wompi](https://docs.wompi.co/)
- [Widget de Checkout](https://docs.wompi.co/docs/widget-checkout)
- [API Reference](https://docs.wompi.co/reference)
- [Tarjetas de prueba](https://docs.wompi.co/docs/tarjetas-de-prueba)

## ✅ Ventajas de esta Solución

| Característica | Proxy Público ❌ | Proxy Local ✅ |
|----------------|------------------|----------------|
| Seguridad      | Baja             | Alta           |
| Estabilidad    | Variable         | Controlada     |
| Velocidad      | Lenta            | Rápida         |
| HTTPS          | Depende          | Sí             |
| Producción     | No recomendado   | Escalable      |
| Costo          | Gratis/Limitado  | Gratis         |

## 🎯 Próximos Pasos

1. ✅ Prueba el widget de Wompi en localhost
2. ✅ Implementa el flujo de pago completo
3. ✅ Prueba con tarjetas de sandbox
4. 🔄 Implementa webhooks para confirmación de pagos
5. 🔄 Despliega a producción con backend dedicado

---

**¿Necesitas ayuda?** Revisa los logs del servidor y la consola del navegador para más detalles.
