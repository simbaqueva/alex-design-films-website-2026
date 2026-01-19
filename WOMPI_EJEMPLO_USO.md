# 🎯 Ejemplo de Uso: Wompi en Página de Pago

## 📝 Implementación Rápida

Aquí tienes un ejemplo completo de cómo integrar Wompi en tu página de pago usando el widget (método recomendado).

## 🚀 Opción 1: Widget de Wompi (Recomendado)

### Paso 1: Importar el módulo

En tu archivo JavaScript principal o en el script de la página de pago:

```javascript
import { initializeWompi } from './modules/wompi-integration.js';
```

### Paso 2: Inicializar Wompi

```javascript
// Inicializar cuando la página cargue
const wompi = initializeWompi({
    publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',
    sandbox: true,
    redirectUrl: window.location.origin + '/confirmacion'
});
```

### Paso 3: Manejar el botón de pago

```javascript
document.getElementById('payment-submit-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Obtener datos del carrito
    const cartData = window.cartManager.getCartData();
    
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    // Obtener datos del formulario
    const customerEmail = document.getElementById('payer-email').value || 
                         document.getElementById('user-email').value;
    const customerPhone = document.getElementById('payer-phone').value || '3001234567';
    const customerName = 'Cliente Alex Design Films'; // Puedes agregar un campo para esto
    
    // Preparar datos de la orden
    const orderData = {
        total: cartData.total,
        customerEmail: customerEmail,
        customerName: customerName,
        customerPhone: customerPhone,
        items: cartData.items
    };
    
    try {
        // Mostrar indicador de carga
        const submitBtn = e.target;
        const btnText = submitBtn.querySelector('.payment-form__submit-text');
        const spinner = submitBtn.querySelector('.payment-form__spinner');
        
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        // Abrir checkout de Wompi
        await wompi.openCheckout(orderData);
        
        // El widget se encargará del resto
        // Cuando el pago se complete, Wompi redirigirá a /confirmacion
        
    } catch (error) {
        console.error('Error al abrir Wompi:', error);
        alert('Error al procesar el pago. Por favor intenta nuevamente.');
        
        // Restaurar botón
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        submitBtn.disabled = false;
    }
});
```

## 🔧 Opción 2: API Directa (Avanzado)

Si necesitas más control sobre el flujo de pago:

### Paso 1: Importar el cliente de API

```javascript
import { initializeWompiAPI } from './modules/wompi-api-client.js';
```

### Paso 2: Inicializar el cliente

```javascript
const wompiAPI = initializeWompiAPI({
    publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',
    sandbox: true
});
```

### Paso 3: Consultar métodos de pago disponibles

```javascript
async function loadPaymentMethods() {
    try {
        const cartTotal = window.cartManager.getTotal();
        const amountInCents = Math.round(cartTotal * 100);
        
        const methods = await wompiAPI.getPaymentMethods(amountInCents);
        
        console.log('Métodos de pago disponibles:', methods);
        
        // Mostrar métodos en el select
        const select = document.getElementById('payment-method-select');
        
        methods.data.forEach(method => {
            const option = document.createElement('option');
            option.value = method.name;
            option.textContent = method.name;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
    }
}

// Llamar cuando la página cargue
loadPaymentMethods();
```

### Paso 4: Consultar una transacción

```javascript
async function checkTransactionStatus(transactionId) {
    try {
        const transaction = await wompiAPI.getTransaction(transactionId);
        
        console.log('Estado de la transacción:', transaction);
        
        return transaction.data.status; // APPROVED, PENDING, DECLINED, etc.
        
    } catch (error) {
        console.error('Error al consultar transacción:', error);
        return null;
    }
}
```

### Paso 5: Obtener bancos PSE

```javascript
async function loadPSEBanks() {
    try {
        const banks = await wompiAPI.getPSEBanks();
        
        console.log('Bancos PSE:', banks);
        
        // Mostrar bancos en un select
        const select = document.getElementById('pse-bank-select');
        
        banks.data.forEach(bank => {
            const option = document.createElement('option');
            option.value = bank.financial_institution_code;
            option.textContent = bank.financial_institution_name;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error al cargar bancos PSE:', error);
    }
}
```

## 🎨 Ejemplo Completo: Página de Pago

Aquí está el código completo para integrar en tu página de pago:

```javascript
// payment-page-logic.js

import { initializeWompi } from './modules/wompi-integration.js';
import { initializeWompiAPI } from './modules/wompi-api-client.js';

class PaymentPage {
    constructor() {
        this.wompi = null;
        this.wompiAPI = null;
        this.init();
    }
    
    async init() {
        // Inicializar Wompi
        this.wompi = initializeWompi({
            publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',
            sandbox: true,
            redirectUrl: window.location.origin + '/confirmacion'
        });
        
        // Inicializar API client (opcional, para consultas)
        this.wompiAPI = initializeWompiAPI({
            publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',
            sandbox: true
        });
        
        // Cargar resumen del pedido
        this.loadOrderSummary();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Cargar métodos de pago disponibles (opcional)
        await this.loadPaymentMethods();
    }
    
    loadOrderSummary() {
        const cartData = window.cartManager.getCartData();
        
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            window.router.navigate('carrito');
            return;
        }
        
        // Mostrar items
        const summaryContent = document.getElementById('payment-summary-content');
        summaryContent.innerHTML = cartData.items.map(item => `
            <div class="payment-summary-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        
        // Mostrar totales
        const summaryTotals = document.getElementById('payment-summary-totals');
        summaryTotals.innerHTML = `
            <div class="payment-summary-row">
                <span>Subtotal:</span>
                <span>$${cartData.subtotal.toFixed(2)}</span>
            </div>
            <div class="payment-summary-row">
                <span>Impuestos:</span>
                <span>$${cartData.tax.toFixed(2)}</span>
            </div>
            <div class="payment-summary-row payment-summary-total">
                <span>Total:</span>
                <span>$${cartData.total.toFixed(2)}</span>
            </div>
        `;
    }
    
    async loadPaymentMethods() {
        try {
            const cartData = window.cartManager.getCartData();
            const amountInCents = Math.round(cartData.total * 100);
            
            const methods = await this.wompiAPI.getPaymentMethods(amountInCents);
            
            console.log('✅ Métodos de pago cargados:', methods);
            
            // Opcional: Mostrar métodos disponibles en la UI
            
        } catch (error) {
            console.error('❌ Error al cargar métodos de pago:', error);
            // No es crítico, el widget de Wompi mostrará los métodos
        }
    }
    
    setupEventListeners() {
        const form = document.getElementById('payment-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processPayment();
        });
    }
    
    async processPayment() {
        try {
            // Obtener datos del carrito
            const cartData = window.cartManager.getCartData();
            
            // Obtener datos del formulario
            const customerEmail = document.getElementById('payer-email').value || 
                                 document.getElementById('user-email').value;
            const customerPhone = document.getElementById('payer-phone').value || '3001234567';
            const description = document.getElementById('description').value || 
                               `Compra en Alex Design Films - ${cartData.items.length} items`;
            
            // Validar email
            if (!customerEmail || !this.isValidEmail(customerEmail)) {
                alert('Por favor ingresa un email válido');
                return;
            }
            
            // Preparar datos de la orden
            const orderData = {
                total: cartData.total,
                customerEmail: customerEmail,
                customerName: 'Cliente Alex Design Films',
                customerPhone: customerPhone,
                customerDocument: '1234567890', // Opcional
                items: cartData.items,
                description: description
            };
            
            // Mostrar indicador de carga
            this.showLoading(true);
            
            // Abrir checkout de Wompi
            const reference = await this.wompi.openCheckout(orderData);
            
            console.log('✅ Checkout abierto con referencia:', reference);
            
            // El widget se encargará del resto
            // Cuando el pago se complete, Wompi redirigirá automáticamente
            
        } catch (error) {
            console.error('❌ Error al procesar pago:', error);
            alert('Error al procesar el pago. Por favor intenta nuevamente.');
            this.showLoading(false);
        }
    }
    
    showLoading(show) {
        const submitBtn = document.getElementById('payment-submit-btn');
        const btnText = submitBtn.querySelector('.payment-form__submit-text');
        const spinner = submitBtn.querySelector('.payment-form__spinner');
        
        if (show) {
            btnText.style.display = 'none';
            spinner.style.display = 'block';
            submitBtn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Inicializar cuando la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PaymentPage();
    });
} else {
    new PaymentPage();
}

export default PaymentPage;
```

## 🧪 Pruebas

### Tarjetas de Prueba (Sandbox)

Usa estas tarjetas para probar:

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| Visa Aprobada | `4242 4242 4242 4242` | APPROVED |
| Mastercard Aprobada | `5555 5555 5555 4444` | APPROVED |
| Visa Rechazada | `4111 1111 1111 1111` | DECLINED |

- **CVC**: Cualquier 3 dígitos (ej: `123`)
- **Fecha**: Cualquier fecha futura (ej: `12/25`)
- **Nombre**: Cualquier nombre

### Flujo de Prueba

1. Agrega productos al carrito
2. Ve a la página de pago (`/pago`)
3. Completa el formulario con un email válido
4. Haz clic en "Procesar Pago"
5. El widget de Wompi se abrirá
6. Usa una tarjeta de prueba
7. Completa el pago
8. Serás redirigido a `/confirmacion`

## 📊 Monitoreo

### En la Consola del Navegador

```
💳 Wompi Widget Integration initialized
✅ Wompi Widget script loaded successfully
🚀 Opening Wompi Widget Checkout: {...}
✅ Transaction approved: {...}
```

### En la Consola del Servidor

```
🔄 Proxy Wompi: transactions/12345
✅ Proxy Wompi exitoso: 200
```

## 🎯 Próximos Pasos

1. ✅ Implementa el código en tu página de pago
2. ✅ Prueba con tarjetas de sandbox
3. 🔄 Implementa webhooks para confirmación
4. 🔄 Agrega manejo de errores personalizado
5. 🔄 Despliega a producción

---

**¿Necesitas ayuda?** Revisa `WOMPI_PROXY_LOCAL.md` para más detalles sobre el proxy.
