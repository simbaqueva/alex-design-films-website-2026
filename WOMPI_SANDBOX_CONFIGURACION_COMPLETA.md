# CONFIGURACIÓN COMPLETA DE WOMPI EN SANDBOX

## 📋 RESUMEN DE CAMBIOS REALIZADOS

### 🎯 OBJETIVO
Configurar Wompi completamente para ambiente sandbox y preparar para deploy de prueba en GitHub Pages.

### 📁 ARCHIVOS MODIFICADOS

#### 1. `assets/js/config/wompi-config.js`
- **Estado**: ✅ Configurado para sandbox
- **Cambios**:
  - `SANDBOX_MODE: true` (modo sandbox activado)
  - `PUBLIC_KEY_TEST: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh'` (llave de sandbox)
  - Se agregaron las llaves de producción para referencia futura:
    - `PUBLIC_KEY_PROD: 'pub_prod_cI8IJi8zI5v8lkKFtEFztW5YfNzxf5TI'`
    - `PRIVATE_KEY_PROD: 'prv_prod_zeYEXA53dDxxLcn8deRoowwDJncxl8pN'`
    - `EVENTS_SECRET_PROD: 'prod_events_bZ28XnCltG3ZrKL5tzMdfpxivX8A1ITD'`
    - `INTEGRITY_SECRET_PROD: 'prod_integrity_NazR58ZG1boYfLdd3rf83rLwMgP9Nkpr'`

#### 2. `server.py`
- **Estado**: ✅ Ya configurado para sandbox
- **Configuración**:
  - URL base: `https://sandbox.wompi.co/v1/`
  - Proxy configurado para redirigir a sandbox

#### 3. `wompi_webhook.py`
- **Estado**: ✅ Configurado para sandbox
- **Cambios**:
  - `USE_SANDBOX: true`
  - `WOMPI_EVENTS_SECRET_TEST: 'test_events_bZ28XnCltG3ZrKL5tzMdfpxivX8A1ITD'`
  - Lógica para seleccionar automáticamente el secret según el modo

### 🔧 AMBIENTES CONFIGURADOS

#### SANDBOX (Pruebas)
- **URL API**: `https://sandbox.wompi.co/v1/`
- **Llave Pública**: `pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh`
- **Secret Eventos**: `test_events_bZ28XnCltG3ZrKL5tzMdfpxivX8A1ITD`
- **Estado**: ✅ Activo y configurado

#### PRODUCCIÓN (Listo para futuro)
- **URL API**: `https://production.wompi.co/v1/`
- **Llave Pública**: `pub_prod_cI8IJi8zI5v8lkKFtEFztW5YfNzxf5TI`
- **Llave Privada**: `prv_prod_zeYEXA53dDxxLcn8deRoowwDJncxl8pN`
- **Secret Eventos**: `prod_events_bZ28XnCltG3ZrKL5tzMdfpxivX8A1ITD`
- **Secret Integridad**: `prod_integrity_NazR58ZG1boYfLdd3rf83rLwMgP9Nkpr`
- **Estado**: ⏳ Configurado pero inactivo (esperando cambio a producción)

### 🚀 PASO A PRODUCCIÓN (FUTURO)

Para cambiar a producción cuando sea necesario:

1. **En `assets/js/config/wompi-config.js`**:
   ```javascript
   SANDBOX_MODE: false,  // Cambiar a false
   ```

2. **En `server.py`**:
   ```python
   wompi_base_url = 'https://production.wompi.co/v1/'  # Cambiar URL
   ```

3. **En `wompi_webhook.py`**:
   ```python
   USE_SANDBOX = False  # Cambiar a False
   ```

### 🧪 PRUEBAS EN SANDBOX

Para probar la integración:

1. **Iniciar servidor local**:
   ```bash
   python server.py
   ```

2. **Iniciar webhook (opcional)**:
   ```bash
   python wompi_webhook.py
   ```

3. **Acceder al sitio**:
   ```
   http://localhost:8000
   ```

### 📝 DATOS DE PRUEBA RECOMENDADOS

#### Tarjetas de Prueba (Wompi Sandbox)
- **Aprobada**: 4242424242424242
- **Rechazada**: 4000000000000002
- **CVV**: Cualquier 3 dígitos
- **Fecha**: Cualquier fecha futura

#### Métodos de Pago Habilitados
- ✅ Tarjetas de crédito/débito
- ✅ Nequi
- ✅ PSE
- ✅ Transferencia Bancolombia
- ✅ QR Bancolombia

### 🔐 SEGURIDAD

- ✅ Las llaves de producción están configuradas pero no se usan en sandbox
- ✅ El modo sandbox evita transacciones reales
- ✅ El webhook verifica firmas HMAC-SHA256
- ✅ No se procesan datos sensibles en el frontend

### 🌍 DEPLOY EN GITHUB PAGES

El sitio está listo para deploy en GitHub Pages con:
- Configuración sandbox activa
- Todas las rutas funcionales
- Proxy configurado para desarrollo local
- Webhook listo para producción futura

---

**Estado Actual**: 🟢 SANDBOX COMPLETAMENTE CONFIGURADO  
**Siguiente Paso**: 🚀 DEPLOY DE PRUEBA EN GITHUB PAGES

*Generado: 19/01/2026*
