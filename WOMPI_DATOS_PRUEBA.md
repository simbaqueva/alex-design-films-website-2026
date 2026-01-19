# 🧪 Datos de Prueba Oficiales de Wompi Sandbox

## 📋 Información Importante

Para realizar transacciones de prueba en el ambiente Sandbox de Wompi, debes usar la llave pública con prefijo `pub_test_`. Todos los siguientes datos son válidos solo en modo Sandbox.

---

## 💳 Tarjetas de Crédito/Débito

### Tarjeta Aprobada
```
Número: 4242 4242 4242 4242
Estado: APPROVED ✅
Fecha: Cualquiera en el futuro
CVC: Cualquiera de 3 dígitos
Nombre: Cualquiera
```

### Tarjeta Declinada
```
Número: 4111 1111 1111 1111
Estado: DECLINED ❌
Fecha: Cualquiera en el futuro
CVC: Cualquiera de 3 dígitos
Nombre: Cualquiera
```

### Otras Tarjetas
```
Cualquier otro número: ERROR ❌
```

---

## 📱 Nequi

### Teléfono Aprobado
```json
{
  "payment_method": {
    "type": "NEQUI",
    "phone_number": "3991111111"
  }
}
```
**Estado:** APPROVED ✅

### Teléfono Declinado
```json
{
  "payment_method": {
    "type": "NEQUI", 
    "phone_number": "3992222222"
  }
}
```
**Estado:** DECLINED ❌

### Otros Teléfonos
- Cualquier otro número: ERROR ❌

---

## 🏦 PSE

### En Integración con API
```json
{
  "payment_method": {
    "type": "PSE",
    "user_type": 0, // 0 = Persona natural, 1 = Persona jurídica
    "user_legal_id_type": "CC", // CC o NIT
    "user_legal_id": "1999888777",
    "financial_institution_code": "1", // 1 = APROBADA, 2 = DECLINADA
    "payment_description": "Pago a Tienda Wompi"
  }
}
```

### En Integración con Widget
- **Banco que aprueba**: Transacción APROBADA ✅
- **Banco que rechaza**: Transacción DECLINADA ❌

---

## 🏦 Transferencia Bancolombia

### En Integración con API
```json
{
  "payment_method": {
    "type": "BANCOLOMBIA_TRANSFER",
    "payment_description": "Pago a Tienda Wompi"
  }
}
```

**Proceso:** Después de crear la transacción, ve a la URL en `data.payment_method.async_payment_url` y selecciona el estado deseado.

---

## 📲 QR Bancolombia

### En Integración con API
```json
{
  "payment_method": {
    "type": "BANCOLOMBIA_QR",
    "payment_description": "Pago a Tienda Wompi",
    "sandbox_status": "APPROVED" // APPROVED, DECLINED o ERROR
  }
}
```

### En Integración con Widget
- **Transacción APROBADA**: Selecciona esta opción
- **Transacción DECLINADA**: Selecciona esta opción  
- **Transacción con ERROR**: Selecciona esta opción

---

## 🎯 Puntos Colombia

```json
{
  "payment_method": {
    "type": "PCOL",
    "sandbox_status": "APPROVED_ONLY_POINTS" // Posibles estados:
  }
}
```

**Estados Posibles:**
- `APPROVED_ONLY_POINTS`: Pago total con puntos
- `APPROVED_HALF_POINTS`: Pago 50% con puntos
- `DECLINED`: Pago solo puntos declinado
- `ERROR`: Error al realizar el pago con solo puntos

---

## 📆 BNPL Bancolombia

En el entorno de prueba, serás redirigido a una página donde podrás definir el estado final de la transacción.

---

## 💰 Daviplata

### Pago Simple
**Códigos OTP:**
- `574829`: APROBADA ✅
- `932015`: DECLINADA ❌
- `186743`: DECLINADA sin saldo ❌
- `999999`: ERROR ❌

### Pago Recurrente (Tokenización)
**Teléfonos para crear token:**
- `3991111111`: Token válido, transacciones aprobadas
- `3992222222`: Token válido, transacciones declinadas
- `3993333333`: Token declinado (monedero inválido)

**Códigos OTP para confirmar token:**
- `574829`: Token aprobado
- `932016`: Token declinado (suscripción existente)
- `Cualquier otro de 6 dígitos`: Código OTP inválido

---

## 📱 Su+ Pay

En el entorno de prueba, serás redirigido a una página donde podrás definir el estado final de la transacción.

---

## 🔧 Cómo Usar estos Datos

### 1. En el Widget de Wompi
El widget mostrará automáticamente las opciones de prueba según el método de pago que selecciones.

### 2. En Integración con API
Usa los datos específicos según el método de pago en el endpoint `/transactions`.

### 3. En Pruebas Automatizadas
Puedes programar tus pruebas para usar diferentes datos y verificar todos los escenarios:
- Pagos aprobados
- Pagos declinados
- Errores de validación
- Casos límite

---

## 📝 Recomendaciones de Testing

### Escenarios Básicos
1. **Pago aprobado con tarjeta** ✅
2. **Pago declinado con tarjeta** ❌
3. **Pago aprobado con Nequi** ✅
4. **Pago declinado con Nequi** ❌
5. **Pago aprobado con PSE** ✅
6. **Pago declinado con PSE** ❌

### Escenarios Avanzados
1. **Tokenización fallida** ❌
2. **Error en datos de tarjeta** ❌
3. **Pago con método no soportado** ❌
4. **Monto inválido** ❌
5. **Referencia duplicada** ❌

### Validaciones Importantes
- ✅ Estados de transacción correctos
- ✅ Redirecciones funcionando
- ✅ Webhooks recibiendo eventos
- ✅ Manejo de errores en frontend
- ✅ Experiencia de usuario en cada caso

---

## 🚀 Integración con Nuestro Sistema

Nuestra configuración ya está preparada para usar estos datos de prueba:

```javascript
// En el flujo de prueba
const orderData = {
    total: 100.00,
    customerEmail: 'test@example.com',
    // ... otros datos
};

// El widget mostrará automáticamente las opciones de prueba
const reference = await wompiIntegration.openCheckout(orderData);
```

### Para Testing Manual
1. Usa la tarjeta `4242 4242 4242 4242` para pagos aprobados
2. Usa la tarjeta `4111 1111 1111 1111` para pagos declinados
3. Usa el teléfono `3991111111` para Nequi aprobado
4. Usa el teléfono `3992222222` para Nequi declinado

### Para Testing Automatizado
```javascript
// En tus pruebas automatizadas
const testCases = [
    { cardNumber: '4242424242424242', expectedStatus: 'APPROVED' },
    { cardNumber: '4111111111111111', expectedStatus: 'DECLINED' },
    { phoneNumber: '3991111111', paymentMethod: 'NEQUI', expectedStatus: 'APPROVED' },
    { phoneNumber: '3992222222', paymentMethod: 'NEQUI', expectedStatus: 'DECLINED' }
];
```

---

## 📚 Referencias

- [Documentación oficial de Wompi](https://docs.wompi.co/)
- [Guía de Sandbox](https://docs.wompi.co/docs/sandbox/)
- [Referencia de API](https://docs.wompi.co/reference/)

---

**Última actualización:** 18/01/2026  
**Versión de Sandbox:** Actualizada con los datos oficiales más recientes
