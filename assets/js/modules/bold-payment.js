/**
 * ===================================
   BOLD PAYMENT INTEGRATION MODULE
   ===================================
 * Módulo para integrar el botón de pagos de Bold
 * en la página del carrito
 */

export class BoldPaymentIntegration {
    constructor() {
        this.apiKey = null;
        this.scriptLoaded = false;
        this.buttonContainer = null;
        this.currentOrderId = null;
        this.integritySignature = null;
        this.backendUrl = this.getBackendUrl();
    }

    /**
     * Obtener URL del backend según el entorno
     */
    getBackendUrl() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        // En producción, usar el mismo dominio
        return window.location.origin;
    }

    /**
     * Inicializar la integración de Bold
     */
    async init(apiKey) {
        this.apiKey = apiKey;
        this.buttonContainer = document.getElementById('cart-page-bold-payment');

        if (!this.buttonContainer) {
            console.error('Bold payment container not found');
            return false;
        }

        // Cargar el script de Bold si no está cargado
        if (!this.scriptLoaded) {
            await this.loadBoldScript();
        }

        return true;
    }

    /**
     * Cargar el script de Bold
     */
    async loadBoldScript() {
        return new Promise((resolve, reject) => {
            // Verificar si el script ya existe
            if (document.querySelector('script[src*="bold.co"]')) {
                this.scriptLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
            script.async = true;

            script.onload = () => {
                this.scriptLoaded = true;
                console.log('✅ Bold payment script loaded');
                resolve();
            };

            script.onerror = () => {
                console.error('❌ Error loading Bold payment script');
                reject(new Error('Failed to load Bold script'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Generar un ID único para la orden
     */
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `ORD-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Generar hash de integridad usando el backend seguro
     * IMPORTANTE: El hash DEBE generarse en el backend por seguridad
     */
    async generateIntegrityHash(orderId, currency, amount) {
        try {
            const response = await fetch(`${this.backendUrl}/api/bold/generate-hash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId,
                    currency,
                    amount
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.hash) {
                throw new Error('Respuesta inválida del servidor');
            }

            console.log('✅ Hash de integridad generado correctamente');
            return data.hash;

        } catch (error) {
            console.error('❌ Error generando hash de integridad:', error);

            // Mostrar error al usuario
            if (window.notificationManager) {
                window.notificationManager.error(
                    'No se pudo conectar con el servidor de pagos. Verifica que el backend esté ejecutándose.',
                    { persistent: true }
                );
            }

            throw error;
        }
    }

    /**
     * Crear y mostrar el botón de pago de Bold
     */
    async createPaymentButton(cartData) {
        if (!this.buttonContainer) {
            console.error('Button container not found');
            return;
        }

        // Verificar que hay productos en el carrito
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            this.hidePaymentButton();
            return;
        }

        try {
            // Generar ID de orden único
            this.currentOrderId = this.generateOrderId();

            // Calcular totales
            const subtotal = cartData.subtotal || 0;
            const tax = cartData.tax || 0;
            const total = subtotal + tax;

            // Convertir a centavos (Bold espera el monto en centavos para COP)
            const amountInCents = Math.round(total * 100);

            // Generar descripción de la orden
            const description = this.generateOrderDescription(cartData.items);

            // Generar hash de integridad usando el backend
            this.integritySignature = await this.generateIntegrityHash(
                this.currentOrderId,
                'COP',
                amountInCents
            );

            // Crear el botón de Bold
            this.renderBoldButton({
                orderId: this.currentOrderId,
                currency: 'COP',
                amount: amountInCents,
                description: description,
                tax: tax > 0 ? 'vat-19' : null,
                redirectionUrl: window.location.origin + '/carrito?payment=success',
                originUrl: window.location.origin + '/carrito?payment=abandoned'
            });

            // Mostrar el contenedor
            this.showPaymentButton();

        } catch (error) {
            console.error('Error creating payment button:', error);
            this.hidePaymentButton();
        }
    }

    /**
     * Generar descripción de la orden
     */
    generateOrderDescription(items) {
        if (!items || items.length === 0) return 'Compra en Alex Design Films';

        if (items.length === 1) {
            return items[0].name;
        }

        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        return `Compra de ${itemCount} producto${itemCount > 1 ? 's' : ''} - Alex Design Films`;
    }

    /**
     * Renderizar el botón de Bold
     */
    renderBoldButton(config) {
        if (!this.buttonContainer) return;

        // Limpiar contenedor
        this.buttonContainer.innerHTML = '';

        // Crear el script tag con los atributos de Bold
        const boldScript = document.createElement('script');
        boldScript.setAttribute('data-bold-button', 'dark-L'); // Estilo del botón
        boldScript.setAttribute('data-order-id', config.orderId);
        boldScript.setAttribute('data-currency', config.currency);
        boldScript.setAttribute('data-amount', config.amount.toString());
        boldScript.setAttribute('data-api-key', this.apiKey);
        boldScript.setAttribute('data-integrity-signature', this.integritySignature);
        boldScript.setAttribute('data-redirection-url', config.redirectionUrl);
        boldScript.setAttribute('data-description', config.description);
        boldScript.setAttribute('data-render-mode', 'embedded'); // Modo embedded para no salir del sitio

        if (config.tax) {
            boldScript.setAttribute('data-tax', config.tax);
        }

        if (config.originUrl) {
            boldScript.setAttribute('data-origin-url', config.originUrl);
        }

        // Agregar el script al contenedor
        this.buttonContainer.appendChild(boldScript);

        // Forzar la ejecución del script de Bold
        if (window.boldPaymentButton && typeof window.boldPaymentButton.init === 'function') {
            window.boldPaymentButton.init();
        }

        console.log('✅ Bold payment button created', {
            orderId: config.orderId,
            amount: config.amount,
            description: config.description
        });
    }

    /**
     * Mostrar el botón de pago
     */
    showPaymentButton() {
        if (this.buttonContainer) {
            this.buttonContainer.style.display = 'block';
            this.buttonContainer.style.opacity = '0';

            // Animar entrada
            requestAnimationFrame(() => {
                this.buttonContainer.style.transition = 'opacity 0.3s ease-in-out';
                this.buttonContainer.style.opacity = '1';
            });
        }
    }

    /**
     * Ocultar el botón de pago
     */
    hidePaymentButton() {
        if (this.buttonContainer) {
            this.buttonContainer.style.opacity = '0';
            setTimeout(() => {
                this.buttonContainer.style.display = 'none';
                this.buttonContainer.innerHTML = '';
            }, 300);
        }
    }

    /**
     * Actualizar el botón cuando cambia el carrito
     */
    async updatePaymentButton(cartData) {
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            this.hidePaymentButton();
        } else {
            await this.createPaymentButton(cartData);
        }
    }

    /**
     * Limpiar la integración
     */
    cleanup() {
        this.hidePaymentButton();
        this.currentOrderId = null;
        this.integritySignature = null;
    }
}

// Crear instancia global
let boldPaymentIntegration;

/**
 * Inicializar la integración de Bold
 */
export function initializeBoldPayment(apiKey) {
    if (!boldPaymentIntegration) {
        boldPaymentIntegration = new BoldPaymentIntegration();
    }
    return boldPaymentIntegration.init(apiKey);
}

/**
 * Obtener instancia de la integración de Bold
 */
export function getBoldPaymentIntegration() {
    if (!boldPaymentIntegration) {
        boldPaymentIntegration = new BoldPaymentIntegration();
    }
    return boldPaymentIntegration;
}

export default BoldPaymentIntegration;
