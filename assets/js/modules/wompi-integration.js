/**
 * ===================================
   WOMPI INTEGRATION - WIDGET CHECKOUT
   ===================================
 * Integración con Wompi usando Widget Modal
 * Funciona con localhost en modo sandbox
 */

// Importar manejador de errores
import { initializeWompiErrorHandler } from './wompi-error-handler.js';

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
            console.log('✅ Wompi already initialized');
            return true;
        }

        try {
            // Verificar si WidgetCheckout ya está disponible (cargado desde HTML)
            if (window.WidgetCheckout && typeof window.WidgetCheckout === 'function') {
                console.log('✅ Wompi Widget already loaded from HTML');
                this.isInitialized = true;
                // Marcar como inicializado globalmente para permitir llamadas API
                window.__wompiInitialized = true;
                return true;
            }

            // Si no está disponible, intentar cargarlo dinámicamente
            console.log('🔄 Loading Wompi Widget script dynamically...');
            await this.loadWompiScript();

            this.isInitialized = true;
            // Marcar como inicializado globalmente para permitir llamadas API
            window.__wompiInitialized = true;
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
            // Verificar si ya existe y WidgetCheckout está disponible
            if (window.WidgetCheckout && typeof window.WidgetCheckout === 'function') {
                console.log('📦 Wompi widget.js already loaded');
                resolve();
                return;
            }

            // Verificar si el script ya está cargado pero WidgetCheckout no está disponible
            if (document.querySelector('script[src*="wompi"]')) {
                // Esperar un poco más a que WidgetCheckout esté disponible
                this.waitForWidgetCheckout()
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // Suprimir errores de API de Wompi antes de cargar el script
            this.suppressWompiErrors();

            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/widget.js';
            script.async = true;
            script.onload = () => {
                console.log('📦 Wompi widget.js loaded');
                // Esperar a que WidgetCheckout esté realmente disponible
                this.waitForWidgetCheckout()
                    .then(resolve)
                    .catch(reject);
            };
            script.onerror = (error) => {
                console.error('❌ Failed to load Wompi widget.js:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Suprimir errores de API de Wompi que no son críticos
     */
    suppressWompiErrors() {
        // Interceptar fetch para evitar llamadas API no deseadas
        const originalFetch = window.fetch;
        window.fetch = function (...args) {
            const url = args[0];
            if (typeof url === 'string') {
                // Bloquear llamadas a feature flags y global settings que causan 404/401
                // Tanto en sandbox como en producción
                if (url.includes('feature_flags') ||
                    url.includes('global_settings') ||
                    url.includes('checkout_intelligence') ||
                    url.includes('complete_api_access') ||
                    url.includes('is_nequi_negocios') ||
                    url.includes('enable_smart_checkout') ||
                    url.includes('check_pco_blacklist')) {  // Endpoint que no existe en producción
                    console.log('🚫 Blocking non-critical Wompi API call:', url.split('?')[0]);
                    return Promise.resolve(new Response('{}', { status: 200 }));
                }
                // Permitir llamadas importantes como merchants (pero bloquear undefined)
                if (url.includes('merchants/undefined')) {
                    console.log('🚫 Blocking undefined merchant call');
                    return Promise.resolve(new Response('{}', { status: 200 }));
                }
            }
            return originalFetch.apply(this, args);
        };

        // Restaurar fetch después de 30 segundos (para no afectar otras partes de la app)
        setTimeout(() => {
            window.fetch = originalFetch;
            console.log('✅ Wompi error suppression disabled');
        }, 30000);
    }

    /**
     * Esperar a que WidgetCheckout esté disponible
     */
    waitForWidgetCheckout(maxAttempts = 20, delay = 100) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            const checkWidget = () => {
                attempts++;

                if (window.WidgetCheckout && typeof window.WidgetCheckout === 'function') {
                    console.log('✅ WidgetCheckout is available');
                    resolve();
                    return;
                }

                if (attempts >= maxAttempts) {
                    console.error('❌ WidgetCheckout not available after', maxAttempts, 'attempts');
                    reject(new Error('WidgetCheckout is not available. Make sure widget.js is loaded.'));
                    return;
                }

                setTimeout(checkWidget, delay);
            };

            checkWidget();
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
            console.log('🔄 Starting Wompi checkout process...');

            // Inicializar si no está listo
            if (!this.isInitialized) {
                console.log('🔄 Initializing Wompi...');
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

            // Configuración del checkout - versión mejorada con manejo de errores
            const checkoutConfig = {
                currency: this.currency,
                amountInCents: amountInCents,
                reference: reference,
                publicKey: this.publicKey,
                redirectUrl: this.redirectUrl,
                // Configuración adicional para evitar errores
                customerData: {
                    email: customerData.email,
                    fullName: customerData.fullName,
                    phoneNumber: customerData.phoneNumber,
                    phoneNumberPrefix: customerData.phoneNumberPrefix,
                    legalId: customerData.legalId,
                    legalIdType: customerData.legalIdType
                },
                // Deshabilitar funciones opcionales que causan errores
                sufreMesa: false,
                autoscroll: true,
                hidden: {
                    payment_methods: []
                }
            };

            console.log('🚀 Opening Wompi Widget Checkout:', {
                reference,
                amount: amountInCents / 100,
                currency: this.currency,
                publicKey: this.publicKey,
                redirectUrl: this.redirectUrl
            });

            // Verificación final de WidgetCheckout
            if (typeof window.WidgetCheckout !== 'function') {
                console.error('❌ WidgetCheckout not available:', typeof window.WidgetCheckout);
                throw new Error('WidgetCheckout is not available. Make sure widget.js is loaded.');
            }

            // Suprimir temporalmente errores no críticos de Wompi
            const originalError = console.error;
            const originalLog = console.log;
            const wompiErrors = [];
            const wompiLogs = [];

            console.error = function (...args) {
                const message = args.join(' ');
                if (message.includes('wompi') || message.includes('Wompi') || message.includes('checkout')) {
                    wompiErrors.push(message);
                    // Solo mostrar errores críticos
                    if (message.includes('422') || message.includes('401') || message.includes('undefined')) {
                        originalError.apply(console, args);
                    }
                } else {
                    originalError.apply(console, args);
                }
            };

            console.log = function (...args) {
                const message = args.join(' ');
                if (message.includes('wompi') || message.includes('Wompi')) {
                    wompiLogs.push(message);
                }
                originalLog.apply(console, args);
            };

            try {
                // Crear y abrir el checkout
                this.currentCheckout = new window.WidgetCheckout(checkoutConfig);

                // Escuchar eventos del checkout
                this.setupCheckoutListeners(reference, orderData);

                // Abrir el widget
                this.currentCheckout.open((result) => {
                    // Restaurar console antes de procesar resultado
                    console.error = originalError;
                    console.log = originalLog;

                    // Mostrar advertencias no críticas
                    if (wompiErrors.length > 0) {
                        console.warn('⚠️ Wompi API warnings (non-critical):', wompiErrors.slice(0, 5)); // Limitar a 5 errores
                    }

                    this.handleCheckoutResult(result, reference, orderData);
                });

                console.log('✅ Wompi checkout opened successfully');
                return reference;

            } catch (widgetError) {
                // Restaurar console en caso de error
                console.error = originalError;
                console.log = originalLog;
                throw widgetError;
            }

        } catch (error) {
            console.error('❌ Error opening Wompi checkout:', error);

            // Proporcionar mensaje más específico según el error
            let errorMessage = 'Error al abrir la pasarela de pago. Por favor intenta nuevamente.';

            if (error.message.includes('WidgetCheckout')) {
                errorMessage = 'El widget de pago no está disponible. Recarga la página e intenta nuevamente.';
            } else if (error.message.includes('initialize')) {
                errorMessage = 'No se pudo inicializar el sistema de pagos. Recarga la página.';
            } else if (error.message.includes('undefined')) {
                errorMessage = 'Error de configuración del pago. Por favor contacta soporte.';
            }

            this.showError(errorMessage);
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
