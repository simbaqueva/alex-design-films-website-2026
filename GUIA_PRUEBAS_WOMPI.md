# 🧪 Guía de Pruebas - Flujo Completo de Pagos con Wompi

## 📋 Objetivo

Probar el flujo completo de pagos en el sitio desplegado en GitHub Pages usando las claves de sandbox de Wompi.

## 🔑 Configuración Actual (Sandbox)

```javascript
publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh'
sandbox: true
redirectUrl: 'https://simbaqueva.github.io/alex-design-films-website-2026/confirmacion'
```

## 🧪 Métodos de Pago Disponibles en Wompi

### 1. Tarjetas de Crédito/Débito

| Tarjeta | Número | CVC | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa Aprobada | `4242 4242 4242 4242` | `123` | `12/25` | APPROVED |
| Mastercard Aprobada | `5555 5555 5555 4444` | `123` | `12/25` | APPROVED |
| Visa Rechazada | `4111 1111 1111 1111` | `123` | `12/25` | DECLINED |
| Amex Aprobada | `3782 822463 10005` | `1234` | `12/25` | APPROVED |

### 2. Nequi

- **Teléfono de prueba**: `3001234567`
- **Resultado**: Simula aprobación automática en sandbox

### 3. PSE (Pago Seguro en Línea)

Bancos de prueba disponibles:
- **Banco que aprueba** - Simula pago exitoso
- **Banco que declina** - Simula pago rechazado
- **Banco que simula un error** - Simula error del sistema

Datos de prueba:
- **Tipo de persona**: Persona Natural (0)
- **Tipo de documento**: CC (Cédula de Ciudadanía)
- **Número de documento**: `1234567890`

### 4. Bancolombia (Botón Bancolombia)

- Simula pago a través de la app de Bancolombia
- En sandbox, aprueba automáticamente

## 📝 Flujo de Prueba Completo

### Paso 1: Acceder al Sitio

1. Abre: https://simbaqueva.github.io/alex-design-films-website-2026/
2. Verifica que el sitio cargue con HTTPS (candado verde)

### Paso 2: Navegar a la Tienda

1. Click en "Tienda" en el menú
2. O click en "Ver Tienda" en la página principal
3. Verifica que los productos se muestren correctamente

### Paso 3: Agregar Productos al Carrito

1. Click en "Agregar al Carrito" en varios productos
2. Verifica que el contador del carrito se actualice
3. Abre el carrito (click en el ícono del carrito)
4. Verifica que los productos estén en el carrito

### Paso 4: Proceder al Pago

1. Click en "Proceder al Pago" en el carrito
2. O navega a `/pago` directamente
3. Verifica que la página de pago cargue

### Paso 5: Completar Formulario de Pago

1. Completa los campos:
   - **Email del comprador**: `test@example.com`
   - **Teléfono**: `3001234567`
   - **Descripción**: (opcional)

2. Click en "Procesar Pago"

### Paso 6: Widget de Wompi

El widget de Wompi debería abrirse mostrando:
- ✅ Monto total del pedido
- ✅ Referencia de la transacción
- ✅ Métodos de pago disponibles

### Paso 7: Probar Cada Método de Pago

#### A. Tarjeta de Crédito

1. Selecciona "Tarjeta de Crédito"
2. Ingresa: `4242 4242 4242 4242`
3. CVC: `123`
4. Fecha: `12/25`
5. Nombre: `TEST USER`
6. Click en "Pagar"
7. **Resultado esperado**: Pago aprobado → Redirección a `/confirmacion`

#### B. Nequi

1. Selecciona "Nequi"
2. Ingresa teléfono: `3001234567`
3. Click en "Pagar"
4. **Resultado esperado**: Simula aprobación → Redirección a `/confirmacion`

#### C. PSE

1. Selecciona "PSE"
2. Selecciona "Banco que aprueba"
3. Tipo de persona: Persona Natural
4. Tipo de documento: CC
5. Número: `1234567890`
6. Click en "Pagar"
7. **Resultado esperado**: Redirección al banco → Aprobación → Redirección a `/confirmacion`

## 📊 Verificaciones en Cada Prueba

### Durante el Pago

- [ ] El widget de Wompi se abre correctamente
- [ ] El monto mostrado es correcto
- [ ] La referencia de transacción se genera
- [ ] Los métodos de pago están disponibles
- [ ] No hay errores en la consola del navegador

### Después del Pago

- [ ] Redirección a `/confirmacion` exitosa
- [ ] Se muestra el mensaje de confirmación
- [ ] La referencia de transacción se muestra
- [ ] El carrito se vacía (si está implementado)

### En la Consola del Navegador (F12)

Busca estos mensajes:
```
💳 Wompi Widget Integration initialized
🚀 Opening Wompi Widget Checkout
✅ Transaction approved
```

## 🔍 Webhooks y Notificaciones

### ⚠️ Limitación Actual

GitHub Pages **NO puede recibir webhooks** directamente porque:
- Es un sitio estático (solo archivos HTML/CSS/JS)
- No tiene un backend para procesar peticiones POST

### Soluciones para Webhooks

#### Opción 1: Usar un Backend Separado (Recomendado)

Servicios que puedes usar:
- **Netlify Functions** (gratuito)
- **Vercel Serverless Functions** (gratuito)
- **AWS Lambda** (gratuito hasta cierto límite)
- **Google Cloud Functions** (gratuito hasta cierto límite)

#### Opción 2: Polling (Consultar Estado)

En lugar de webhooks, consultar el estado de la transacción:

```javascript
async function checkTransactionStatus(transactionId) {
    const wompiAPI = initializeWompiAPI();
    const transaction = await wompiAPI.getTransaction(transactionId);
    return transaction.data.status; // APPROVED, PENDING, DECLINED
}
```

### Configurar Webhooks (Para Producción)

1. Ve a https://comercios.wompi.co/
2. Inicia sesión
3. Ve a Configuración → Webhooks
4. Agrega la URL de tu backend:
   ```
   https://tu-backend.com/webhooks/wompi
   ```
5. Selecciona los eventos:
   - `transaction.updated`
   - `transaction.approved`
   - `transaction.declined`

## 📝 Checklist de Pruebas

### Pruebas Básicas
- [ ] Sitio carga con HTTPS
- [ ] Navegación SPA funciona
- [ ] Productos se muestran en la tienda
- [ ] Carrito funciona correctamente
- [ ] Página de pago carga

### Pruebas de Pagos
- [ ] Widget de Wompi se abre
- [ ] Tarjeta Visa aprobada funciona
- [ ] Tarjeta Mastercard aprobada funciona
- [ ] Tarjeta rechazada muestra error
- [ ] Nequi funciona (si está disponible)
- [ ] PSE funciona (si está disponible)

### Pruebas de Flujo
- [ ] Redirección a confirmación funciona
- [ ] Mensaje de éxito se muestra
- [ ] Referencia de transacción se guarda
- [ ] Carrito se vacía después del pago

### Pruebas de Errores
- [ ] Pago rechazado muestra mensaje apropiado
- [ ] Cerrar widget sin pagar funciona
- [ ] Timeout de pago se maneja correctamente

## 🐛 Problemas Comunes y Soluciones

### Widget no se abre

**Causa**: Falta HTTPS o error en la configuración
**Solución**: 
1. Verifica que estés en HTTPS
2. Abre la consola (F12) y busca errores
3. Verifica que `redirectUrl` sea correcta

### Error 403 de Wompi

**Causa**: Origen no permitido
**Solución**: 
1. Verifica que estés usando la URL de GitHub Pages
2. No uses `http://localhost` para pruebas de widget

### Pago no se procesa

**Causa**: Datos de tarjeta incorrectos o red
**Solución**:
1. Usa las tarjetas de prueba exactas
2. Verifica la conexión a internet
3. Revisa la consola para errores

### No redirige a confirmación

**Causa**: `redirectUrl` incorrecta
**Solución**:
1. Verifica que la URL incluya el nombre del repositorio
2. Debe ser: `https://simbaqueva.github.io/alex-design-films-website-2026/confirmacion`

## 📊 Registro de Pruebas

Usa esta tabla para documentar tus pruebas:

| Método de Pago | Tarjeta/Datos | Resultado | Notas |
|----------------|---------------|-----------|-------|
| Visa | 4242... | ✅ APPROVED | |
| Mastercard | 5555... | ✅ APPROVED | |
| Visa Rechazada | 4111... | ❌ DECLINED | |
| Nequi | 3001234567 | | |
| PSE | Banco aprueba | | |

## 🎯 Próximos Pasos

Después de completar las pruebas:

1. ✅ Verificar que todo funcione correctamente
2. 🔄 Obtener claves de producción de Wompi
3. 🔄 Configurar webhooks en un backend
4. 🔄 Actualizar configuración a producción
5. 🔄 Hacer deploy final

---

**¿Listo para comenzar las pruebas?** Abre el sitio y sigue esta guía paso a paso.
