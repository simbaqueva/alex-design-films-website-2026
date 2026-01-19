/**
 * ===================================
   WOMPI CONFIGURATION
   ===================================
 * Configuración centralizada para Wompi
 */

export const WOMPI_CONFIG = {
    // ========================================
    // MODO DE OPERACIÓN
    // ========================================
    // true = Modo prueba (sandbox)
    // false = Modo producción (pagos reales)
    SANDBOX_MODE: true,

    // ========================================
    // LLAVES DE API
    // ========================================
    // Llave pública de prueba (sandbox) - Actualizada según documentación
    PUBLIC_KEY_TEST: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',

    // Llave pública de producción - Proporcionada por el usuario
    // ⚠️ IMPORTANTE: Estas son las llaves reales de producción
    PUBLIC_KEY_PROD: 'pub_prod_cI8IJi8zI5v8lkKFtEFztW5YfNzxf5TI',

    // Llave privada de producción (solo para backend/webhook)
    PRIVATE_KEY_PROD: 'prv_prod_zeYEXA53dDxxLcn8deRoowwDJncxl8pN',

    // Secretos para integración técnica
    EVENTS_SECRET_PROD: 'prod_events_bZ28XnCltG3ZrKL5tzMdfpxivX8A1ITD',
    INTEGRITY_SECRET_PROD: 'prod_integrity_NazR58ZG1boYfLdd3rf83rLwMgP9Nkpr',

    // ========================================
    // CONFIGURACIÓN DE PAGOS
    // ========================================
    // Moneda (COP = Pesos Colombianos)
    CURRENCY: 'COP',

    // URL de redirección después del pago
    // En modo sandbox, Wompi acepta localhost
    // En producción, debe ser una URL pública HTTPS
    REDIRECT_URL: window.location.origin + window.location.pathname + '#confirmacion',

    // ========================================
    // DATOS DEL COMERCIO
    // ========================================
    MERCHANT_NAME: 'Alex Design Films',
    MERCHANT_EMAIL: 'contacto@alexdesignfilms.com',

    // Merchant ID para sandbox (obtenido de la configuración de Wompi)
    // Este ID se usa para algunas llamadas a la API interna de Wompi
    MERCHANT_ID: 'dev_4cF8D3G2j9X7zK5mN3pQ', // ID de comerciante sandbox de ejemplo

    // ========================================
    // MÉTODOS DE PAGO HABILITADOS
    // ========================================
    // Wompi soporta múltiples métodos de pago:
    // - CARD: Tarjetas de crédito/débito
    // - NEQUI: Pago con Nequi
    // - PSE: Transferencias bancarias (PSE)
    // - BANCOLOMBIA_TRANSFER: Transferencia Bancolombia
    // - BANCOLOMBIA_QR: QR Bancolombia
    PAYMENT_METHODS: {
        CARD: true,                    // Tarjetas de crédito/débito
        NEQUI: true,                   // Nequi
        PSE: true,                     // PSE (Transferencias bancarias)
        BANCOLOMBIA_TRANSFER: true,    // Transferencia Bancolombia
        BANCOLOMBIA_QR: true           // QR Bancolombia
    },

    // Obtener métodos de pago habilitados
    getEnabledPaymentMethods() {
        return Object.keys(this.PAYMENT_METHODS)
            .filter(method => this.PAYMENT_METHODS[method]);
    },

    // ========================================
    // CONFIGURACIÓN DE IMPUESTOS
    // ========================================
    TAX_RATE: 0.19, // 19% IVA en Colombia

    // ========================================
    // CONFIGURACIÓN DE NOTIFICACIONES
    // ========================================
    // Email para recibir notificaciones de pagos
    NOTIFICATION_EMAIL: 'ventas@alexdesignfilms.com',

    // ========================================
    // CONFIGURACIÓN AVANZADA
    // ========================================
    // Tiempo de expiración del checkout (en segundos)
    CHECKOUT_TIMEOUT: 1800, // 30 minutos

    // Habilitar logs de debug
    DEBUG_MODE: true,

    // ========================================
    // MÉTODOS AUXILIARES
    // ========================================

    /**
     * Obtener la llave pública según el modo
     */
    getPublicKey() {
        return this.SANDBOX_MODE ? this.PUBLIC_KEY_TEST : this.PUBLIC_KEY_PROD;
    },

    /**
     * Verificar si está en modo producción
     */
    isProduction() {
        return !this.SANDBOX_MODE;
    },

    /**
     * Obtener configuración completa para Wompi
     */
    getWompiConfig() {
        return {
            publicKey: this.getPublicKey(),
            currency: this.CURRENCY,
            sandbox: this.SANDBOX_MODE,
            redirectUrl: this.REDIRECT_URL,
            merchantName: this.MERCHANT_NAME,
            paymentMethods: this.PAYMENT_METHODS,
            debug: this.DEBUG_MODE
        };
    },

    /**
     * Log de debug (solo si DEBUG_MODE está activo)
     */
    log(...args) {
        if (this.DEBUG_MODE) {
            console.log('[WOMPI]', ...args);
        }
    },

    /**
     * Validar configuración
     */
    validate() {
        const errors = [];

        // Validar llave de producción si no está en sandbox
        if (!this.SANDBOX_MODE && this.PUBLIC_KEY_PROD === 'pub_prod_TU_LLAVE_AQUI') {
            errors.push('⚠️ Debes configurar tu llave pública de producción en WOMPI_CONFIG.PUBLIC_KEY_PROD');
        }

        // Validar moneda
        if (!['COP', 'USD'].includes(this.CURRENCY)) {
            errors.push('⚠️ Moneda no soportada. Usa COP o USD');
        }

        // Validar URL de redirección
        if (!this.REDIRECT_URL || !this.REDIRECT_URL.startsWith('http')) {
            errors.push('⚠️ URL de redirección inválida');
        }

        if (errors.length > 0) {
            console.error('❌ Errores de configuración de Wompi:');
            errors.forEach(error => console.error(error));
            return false;
        }

        this.log('✅ Configuración de Wompi válida');
        return true;
    }
};

// Validar configuración al cargar
WOMPI_CONFIG.validate();

export default WOMPI_CONFIG;
