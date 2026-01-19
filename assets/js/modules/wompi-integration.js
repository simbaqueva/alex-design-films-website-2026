/**
 * ===================================
   WOMPI INTEGRATION - WIDGET CHECKOUT
   ===================================
 * Integración con Wompi usando Widget Modal
 * Funciona con localhost en modo sandbox
 */

export class WompiIntegration {
    constructor(config = {}) {
        // Configuración
        this.publicKey = config.publicKey || 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh';
        this.currency = config.currency || 'COP';
        this.redirectUrl = config.redirectUrl || window.location.origin + '/confirmacion';
        this.sandbox = config.sandbox !== false;

        // Estado
        this.isInitialized = false;
        this.currentCheckout = null;

        console.log('💳 Wompi Widget Integration initialized', {
            sandbox: this.sandbox,
            publicKey: this.publicKey,
            origin: window.location.origin
        });
    }

    /**
     * Inicializar el script de Wompi
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        try {
            // Cargar el script de Wompi si no está cargado
            if (!window.WidgetCheckout) {
                await this.loadWompiScript();
            }

            this.isInitialized = true;
            console.log('✅ Wompi Widget script loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error loading Wompi script:', error);
            return false;
        }
    }

    /**
     * Cargar el script de Wompi dinámicamente
     */
    loadWompiScript() {
        return new Promise((resolve, reject) => {
            // Verificar si ya existe
            if (document.querySelector('script[src*="wompi"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/widget.js';
            script.async = true;
            script.onload = () => {
                console.log('📦 Wompi widget.js loaded');
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Failed to load Wompi widget.js:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Generar referencia única para la transacción
     */
    generateReference() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `ADF-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Abrir checkout de Wompi con Widget Modal
     */
    async openCheckout(orderData) {
        try {
            // Inicializar si no está listo
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Failed to initialize Wompi');
                }
            }

            // Validar datos de la orden
            if (!orderData || !orderData.total || orderData.total <= 0) {
                throw new Error('Invalid order data');
            }

            // Generar referencia única
            const reference = this.generateReference();

            // Convertir total a centavos (Wompi requiere el monto en centavos)
            const amountInCents = Math.max(Math.round(orderData.total * 100), 100);

            // Preparar datos del cliente
            const customerData = this.prepareCustomerData(orderData);

            // Configuración del checkout
            const checkoutConfig = {
                currency: this.currency,
                amountInCents: amountInCents,
                reference: reference,
                publicKey: this.publicKey,
                redirectUrl: this.redirectUrl,
                customerData: customerData,
                // Personalización del widget
                customerEmail: customerData.email || '',
                customerFullName: customerData.fullName || '',
                customerPhoneNumber: customerData.phoneNumber || ''
            };

            console.log('🚀 Opening Wompi Widget Checkout:', {
                reference,
                amount: amountInCents / 100,
                currency: this.currency,
                config: checkoutConfig
            });

            // Verificar que WidgetCheckout esté disponible
            if (typeof window.WidgetCheckout !== 'function') {
                throw new Error('WidgetCheckout is not available. Make sure widget.js is loaded.');
            }

            // Crear y abrir el checkout
            this.currentCheckout = new window.WidgetCheckout(checkoutConfig);

            // Escuchar eventos del checkout
            this.setupCheckoutListeners(reference, orderData);

            // Abrir el widget
            this.currentCheckout.open((result) => {
                this.handleCheckoutResult(result, reference, orderData);
            });

            return reference;

        } catch (error) {
            console.error('❌ Error opening Wompi checkout:', error);
            this.showError('Error al abrir la pasarela de pago. Por favor intenta nuevamente.');
            throw error;
        }
    }

    /**
     * Mostrar advertencia de localhost
     */
    showLocalhostWarning() {
        const message = `
⚠️ ADVERTENCIA: Estás usando localhost sin HTTPS

Wompi requiere HTTPS para funcionar correctamente.

SOLUCIONES:

1. Usar ngrok (Recomendado):
   - Ejecuta: .\\start_with_ngrok.bat
   - Usa la URL HTTPS que te proporciona ngrok

2. Desplegar a producción:
   - GitHub Pages (HTTPS gratuito)
   - Netlify, Vercel, etc.

Consulta WOMPI_403_SOLUCION.md para más detalles.
        `;

        console.warn(message);
        alert('⚠️ Wompi requiere HTTPS\n\nPor favor usa ngrok o despliega a producción.\n\nConsulta la consola para más detalles.');
    }

    /**
     * Preparar datos del cliente
     */
    prepareCustomerData(orderData) {
        return {
            email: orderData.customerEmail || 'cliente@example.com',
            fullName: orderData.customerName || 'Cliente Alex Design Films',
            phoneNumber: orderData.customerPhone || '3001234567',
            phoneNumberPrefix: '+57',
            legalId: orderData.customerDocument || '1234567890',
            legalIdType: 'CC'
        };
    }

    /**
     * Configurar listeners para eventos del checkout
     */
    setupCheckoutListeners(reference, orderData) {
        // Wompi dispara eventos que podemos escuchar
        window.addEventListener('message', (event) => {
            // Verificar que el mensaje viene de Wompi
            if (event.origin !== 'https://checkout.wompi.co') {
                return;
            }

            const data = event.data;

            if (data.type === 'WOMPI_CHECKOUT_CLOSED') {
                console.log('🔒 Checkout closed by user');
                this.handleCheckoutClosed(reference);
            }
        });
    }

    /**
     * Manejar resultado del checkout
     */
    handleCheckoutResult(result, reference, orderData) {
        console.log('📊 Checkout result:', result);

        if (result.transaction) {
            const transaction = result.transaction;

            // Guardar información de la transacción
            this.saveTransactionInfo({
                reference: reference,
                transactionId: transaction.id,
                status: transaction.status,
                orderData: orderData,
                timestamp: Date.now()
            });

            // Redirigir según el estado
            switch (transaction.status) {
                case 'APPROVED':
                    this.handleApprovedTransaction(transaction, orderData);
                    break;
                case 'PENDING':
                    this.handlePendingTransaction(transaction, orderData);
                    break;
                case 'DECLINED':
                case 'ERROR':
                    this.handleFailedTransaction(transaction, orderData);
                    break;
                default:
                    console.warn('Unknown transaction status:', transaction.status);
            }
        }
    }

    /**
     * Manejar checkout cerrado
     */
    handleCheckoutClosed(reference) {
        console.log('User closed checkout:', reference);
        this.showNotification('Pago cancelado', 'info');
    }

    /**
     * Manejar transacción aprobada
     */
    handleApprovedTransaction(transaction, orderData) {
        console.log('✅ Transaction approved:', transaction);

        // Limpiar carrito
        if (window.cartManager) {
            window.cartManager.clearCart();
        }

        // Mostrar mensaje de éxito
        this.showNotification('¡Pago exitoso! Gracias por tu compra.', 'success');

        // Redirigir a página de confirmación
        setTimeout(() => {
            window.location.href = `/confirmacion?ref=${transaction.reference}`;
        }, 2000);
    }

    /**
     * Manejar transacción pendiente
     */
    handlePendingTransaction(transaction, orderData) {
        console.log('⏳ Transaction pending:', transaction);

        this.showNotification('Pago pendiente. Te notificaremos cuando se confirme.', 'info');

        // Redirigir a página de confirmación
        setTimeout(() => {
            window.location.href = `/confirmacion?ref=${transaction.reference}&status=pending`;
        }, 2000);
    }

    /**
     * Manejar transacción fallida
     */
    handleFailedTransaction(transaction, orderData) {
        console.log('❌ Transaction failed:', transaction);

        this.showError('El pago no pudo ser procesado. Por favor intenta nuevamente.');
    }

    /**
     * Guardar información de la transacción en localStorage
     */
    saveTransactionInfo(transactionInfo) {
        try {
            const key = `wompi_transaction_${transactionInfo.reference}`;
            localStorage.setItem(key, JSON.stringify(transactionInfo));
            console.log('💾 Transaction info saved:', transactionInfo.reference);
        } catch (error) {
            console.error('Error saving transaction info:', error);
        }
    }

    /**
     * Obtener información de una transacción
     */
    getTransactionInfo(reference) {
        try {
            const key = `wompi_transaction_${reference}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting transaction info:', error);
            return null;
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        if (window.notificationManager) {
            window.notificationManager[type](message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }

    /**
     * Mostrar error
     */
    showError(message) {
        this.showNotification(message, 'error');
    }
}

/**
 * Inicializar integración de Wompi
 */
export function initializeWompi(config = {}) {
    if (!window.wompiIntegration) {
        window.wompiIntegration = new WompiIntegration(config);
    }
    return window.wompiIntegration;
}

export default WompiIntegration;
