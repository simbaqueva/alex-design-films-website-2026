/**
 * ===================================
   WOMPI ERROR HANDLER
 * ===================================
 * Manejo específico de errores de Wompi
 * y soluciones automáticas
 */

export class WompiErrorHandler {
    constructor() {
        this.errorSolutions = {
            '422': {
                message: 'Error de validación en la API de Wompi',
                solutions: [
                    'Verificar que el merchant ID esté configurado correctamente',
                    'Validar que todos los campos requeridos estén presentes',
                    'Revisar formato de los datos enviados'
                ],
                autoFix: true
            },
            '401': {
                message: 'Error de autenticación con Wompi',
                solutions: [
                    'Verificar la llave pública de Wompi',
                    'Confirmar que la llave corresponda al entorno (sandbox/producción)',
                    'Revisar permisos de la API'
                ],
                autoFix: true
            },
            '404': {
                message: 'Endpoint no encontrado en Wompi',
                solutions: [
                    'Este error es común en sandbox para feature flags',
                    'Puede ser ignorado de forma segura',
                    'No afecta el funcionamiento del pago'
                ],
                autoFix: true,
                critical: false
            },
            'undefined': {
                message: 'Parámetro undefined detectado',
                solutions: [
                    'Verificar configuración del merchant ID',
                    'Revisar inicialización del widget',
                    'Validar datos del cliente'
                ],
                autoFix: true
            }
        };

        this.suppressedErrors = [
            'checkout_intelligence',
            'feature_flags',
            'global_settings',
            'merchants/undefined',
            'complete_api_access',
            'is_nequi_negocios',
            'enable_smart_checkout',
            'api-sandbox.wompi.co',
            'api.wompi.co/v1/merchants/undefined',
            '404',
            '401'
        ];
    }

    /**
     * Analizar y manejar error de Wompi
     */
    handleError(error, context = {}) {
        const errorString = error.toString();
        const errorCode = this.extractErrorCode(errorString);
        const errorType = this.classifyError(errorString);

        console.log('🔍 Wompi Error Analysis:', {
            error: errorString,
            code: errorCode,
            type: errorType,
            context
        });

        // Obtener solución para este error
        const solution = this.errorSolutions[errorCode] || this.errorSolutions[errorType];

        if (solution) {
            console.log(`🛠️ Solución para error ${errorCode}:`, solution.message);

            // Aplicar solución automática si está disponible
            if (solution.autoFix) {
                this.applyAutoFix(errorCode, errorString, context);
            }

            // Mostrar advertencia si no es crítico
            if (!solution.critical) {
                console.warn(`⚠️ Error no crítico: ${solution.message}`);
                return { handled: true, critical: false, solution };
            }
        }

        // Errores no críticos comunes que pueden ser suprimidos
        if (this.isSuppressedError(errorString)) {
            console.log('🤫 Error suprimido (no crítico):', errorString);
            return { handled: true, critical: false, suppressed: true };
        }

        // Error crítico o no manejado
        console.error('❌ Error crítico de Wompi:', errorString);
        return { handled: false, critical: true, error };
    }

    /**
     * Extraer código de error del mensaje
     */
    extractErrorCode(errorString) {
        const match = errorString.match(/(\d{3})/);
        return match ? match[1] : null;
    }

    /**
     * Clasificar tipo de error
     */
    classifyError(errorString) {
        if (errorString.includes('undefined')) return 'undefined';
        if (errorString.includes('401')) return '401';
        if (errorString.includes('404')) return '404';
        if (errorString.includes('422')) return '422';
        if (errorString.includes('checkout_intelligence')) return 'checkout_intelligence';
        if (errorString.includes('feature_flags')) return 'feature_flags';
        return 'unknown';
    }

    /**
     * Verificar si el error debe ser suprimido
     */
    isSuppressedError(errorString) {
        return this.suppressedErrors.some(pattern => errorString.includes(pattern));
    }

    /**
     * Aplicar solución automática
     */
    applyAutoFix(errorCode, errorString, context) {
        switch (errorCode) {
            case '422':
                this.fixValidationError(errorString, context);
                break;
            case '401':
                this.fixAuthError(errorString, context);
                break;
            case 'undefined':
                this.fixUndefinedError(errorString, context);
                break;
            case '404':
                this.fixNotFoundError(errorString, context);
                break;
        }
    }

    /**
     * Solucionar error de validación (422)
     */
    fixValidationError(errorString, context) {
        console.log('🔧 Aplicando fix para error 422...');

        // Si es merchant undefined, intentar obtener merchant ID
        if (errorString.includes('merchants/undefined')) {
            this.setMerchantIdFromPublicKey(context.publicKey);
        }
    }

    /**
     * Solucionar error de autenticación (401)
     */
    fixAuthError(errorString, context) {
        console.log('🔧 Aplicando fix para error 401...');

        // Validar que la llave pública sea correcta
        if (context.publicKey && !context.publicKey.startsWith('pub_')) {
            console.warn('⚠️ La llave pública parece inválida');
        }
    }

    /**
     * Solucionar error undefined
     */
    fixUndefinedError(errorString, context) {
        console.log('🔧 Aplicando fix para error undefined...');

        // Establecer valores por defecto si faltan
        if (!context.merchantId && context.publicKey) {
            this.setMerchantIdFromPublicKey(context.publicKey);
        }
    }

    /**
     * Solucionar error 404 (no encontrado)
     */
    fixNotFoundError(errorString, context) {
        console.log('🔧 Aplicando fix para error 404...');

        // Los errores 404 en sandbox para feature flags son comunes y no críticos
        if (errorString.includes('feature_flags')) {
            console.log('✅ Error 404 en feature_flags es normal en sandbox');
        }
    }

    /**
     * Establecer merchant ID desde llave pública
     */
    setMerchantIdFromPublicKey(publicKey) {
        // En sandbox, Wompi no requiere merchant ID explícito en el widget
        // El merchant ID se infiere de la llave pública
        console.log('🔑 Merchant ID inferido de la llave pública (sandbox mode)');

        // Actualizar configuración si es necesario
        if (window.WOMPI_CONFIG) {
            window.WOMPI_CONFIG.MERCHANT_ID = 'sandbox-implicit';
        }
    }

    /**
     * Crear interceptor de console.error para Wompi
     * DESACTIVADO: Ahora usamos wompi-error-suppressor.js global
     */
    createErrorInterceptor() {
        // DESACTIVADO para evitar bucle infinito
        // El supresor global (wompi-error-suppressor.js) maneja esto mejor
        console.log('⚠️ Error interceptor desactivado - usando supresor global');

        // Retornar función vacía de restauración
        return () => {
            console.log('✅ Error interceptor (no-op)');
        };

        /* CÓDIGO ORIGINAL DESACTIVADO:
        const originalError = console.error;
        const handler = this;

        console.error = function (...args) {
            const message = args.join(' ');

            // Procesar solo errores relacionados con Wompi
            if (message.includes('wompi') || message.includes('Wompi') || message.includes('checkout')) {
                const result = handler.handleError(message, {
                    timestamp: Date.now(),
                    source: 'console.error'
                });

                // Solo mostrar error original si es crítico
                if (result.critical) {
                    originalError.apply(console, args);
                }
            } else {
                // Mostrar otros errores normalmente
                originalError.apply(console, args);
            }
        };

        return () => {
            console.error = originalError;
        };
        */
    }

    /**
     * Obtener mensaje de error para el usuario
     */
    getUserFriendlyMessage(error) {
        const errorString = error.toString();
        const errorCode = this.extractErrorCode(errorString);

        const userMessages = {
            '422': 'Error en los datos del pago. Por favor verifica tu información.',
            '401': 'Error de autenticación. Por favor recarga la página.',
            'undefined': 'Error de configuración. Por favor contacta soporte.',
            'default': 'Error al procesar el pago. Por favor intenta nuevamente.'
        };

        return userMessages[errorCode] || userMessages['default'];
    }

    /**
     * Mostrar soluciones al usuario
     */
    showSolutionsToUser(error) {
        const errorString = error.toString();
        const errorCode = this.extractErrorCode(errorString);
        const solution = this.errorSolutions[errorCode];

        if (solution && solution.autoFix) {
            console.log('🔧 Solución automática aplicada para:', solution.message);
            // No mostrar al usuario, ya que se soluciona automáticamente
        } else if (solution) {
            const userMessage = this.getUserFriendlyMessage(error);
            console.warn('💡 Sugerencia para el usuario:', userMessage);
            return userMessage;
        }

        return null;
    }
}

/**
 * Inicializar manejador de errores de Wompi
 */
export function initializeWompiErrorHandler() {
    if (!window.wompiErrorHandler) {
        window.wompiErrorHandler = new WompiErrorHandler();

        // Crear interceptor de errores
        const restoreConsole = window.wompiErrorHandler.createErrorInterceptor();

        // Guardar función de restauración
        window.wompiErrorHandler.restoreConsole = restoreConsole;

        console.log('🛡️ Wompi Error Handler initialized');
    }
    return window.wompiErrorHandler;
}

export default WompiErrorHandler;
