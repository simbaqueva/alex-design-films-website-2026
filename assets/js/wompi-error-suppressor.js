/**
 * ===================================
 * WOMPI ERROR SUPPRESSOR - GLOBAL
 * ===================================
 * Este script debe cargarse ANTES que cualquier otro script
 * para interceptar errores de Wompi desde el inicio
 */

(function () {
    'use strict';

    console.log('🛡️ Wompi Global Error Suppressor activado');

    // Flag para controlar si Wompi ha sido inicializado manualmente
    window.__wompiInitialized = false;

    // Lista de patrones de URL a bloquear SIEMPRE
    const alwaysBlockedPatterns = [
        'feature_flags',
        'global_settings',
        'checkout_intelligence',
        'complete_api_access',
        'is_nequi_negocios',
        'enable_smart_checkout',
        'check_pco_blacklist',  // Endpoint que no existe en producción
        'pco_blacklist',        // Variación del endpoint
        'merchants/undefined',   // Merchant ID undefined
        '/undefined',            // Cualquier URL con undefined
    ];

    // Patrones a bloquear SOLO antes de inicialización
    const blockBeforeInitPatterns = [
        'merchants/',  // Bloquear merchants hasta que se inicialice con key válida
    ];

    // Interceptar fetch INMEDIATAMENTE
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        const url = args[0];

        if (typeof url === 'string') {
            // PERMITIR la carga de scripts de Wompi (widget.js, v1.js)
            if (url.includes('checkout.wompi.co/widget.js') ||
                url.includes('checkout.wompi.co/v1.js') ||
                url.endsWith('widget.js') ||
                url.endsWith('v1.js')) {
                return originalFetch.apply(this, args);
            }

            // BLOQUEAR TODAS las llamadas a la API de Wompi si no está inicializado
            if (!window.__wompiInitialized && (url.includes('api.wompi.co') || url.includes('api-sandbox.wompi.co'))) {
                console.log('🚫 [Global] Blocked pre-init Wompi API call:', url.split('?')[0].split('/').slice(-2).join('/'));
                return Promise.resolve(new Response(JSON.stringify({}), {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'application/json' }
                }));
            }

            // BLOQUEAR patrones que siempre deben bloquearse
            const shouldAlwaysBlock = alwaysBlockedPatterns.some(pattern => url.includes(pattern));
            if (shouldAlwaysBlock) {
                console.log('🚫 [Global] Blocked non-critical Wompi API call:', url.split('?')[0].split('/').pop());
                return Promise.resolve(new Response(JSON.stringify({}), {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'application/json' }
                }));
            }

            // BLOQUEAR merchants/undefined SIEMPRE
            if (url.includes('merchants/undefined') || url.includes('/undefined')) {
                console.log('🚫 [Global] Blocked undefined merchant call');
                return Promise.resolve(new Response(JSON.stringify({}), {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'application/json' }
                }));
            }

            // PERMITIR llamadas importantes de Wompi (solo después de init)
            if (window.__wompiInitialized) {
                if (url.includes('/transactions') ||
                    url.includes('/payment_sources') ||
                    url.includes('/tokens') ||
                    (url.includes('/merchants/') && (url.includes('pub_test_') || url.includes('pub_prod_')))) {
                    return originalFetch.apply(this, args);
                }
            }
        }

        // Permitir todas las demás llamadas
        return originalFetch.apply(this, args);
    };

    // Interceptar XMLHttpRequest también (por si acaso)
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (typeof url === 'string') {
            const shouldBlock = alwaysBlockedPatterns.some(pattern => url.includes(pattern)) ||
                url.includes('undefined') ||
                (!window.__wompiInitialized && url.includes('/merchants/'));

            if (shouldBlock) {
                console.log('🚫 [Global] Blocked XHR call:', url.split('?')[0].split('/').pop());
                // Modificar la URL para que falle silenciosamente
                url = 'data:application/json,{}';
            }
        }

        return originalXHROpen.call(this, method, url, ...rest);
    };

    // Suprimir errores de consola relacionados con Wompi
    const originalConsoleError = console.error;
    console.error = function (...args) {
        const message = args.join(' ');

        // Lista de mensajes a suprimir
        const suppressPatterns = [
            'feature_flags',
            'global_settings',
            'checkout_intelligence',
            'complete_api_access',
            'is_nequi_negocios',
            'enable_smart_checkout',
            'merchants/undefined',
            '/undefined',
            'api-sandbox.wompi.co',
            'api.wompi.co/v1/merchants/undefined',
            'check_pco_blacklist',
            '404 ()',
            '422 (Unprocessable Content)',
            'Failed to load resource'
        ];

        // Verificar si el mensaje debe ser suprimido
        const shouldSuppress = suppressPatterns.some(pattern =>
            message.toLowerCase().includes(pattern.toLowerCase())
        );

        if (shouldSuppress) {
            // Suprimir el error (no mostrarlo)
            // Solo log en modo debug
            if (window.__wompiDebug) {
                console.log('🤫 [Suppressed]:', message.substring(0, 80));
            }
            return;
        }

        // Mostrar otros errores normalmente
        originalConsoleError.apply(console, args);
    };

    // Suprimir warnings también
    const originalConsoleWarn = console.warn;
    console.warn = function (...args) {
        const message = args.join(' ');

        if (message.includes('wompi') || message.includes('Wompi') ||
            message.includes('feature_flags') || message.includes('global_settings') ||
            message.includes('check_pco_blacklist') || message.includes('undefined')) {
            if (window.__wompiDebug) {
                console.log('🤫 [Suppressed warning]:', message.substring(0, 80));
            }
            return;
        }

        originalConsoleWarn.apply(console, args);
    };

    // Interceptar window.$wompi si se intenta inicializar automáticamente
    Object.defineProperty(window, '$wompi', {
        get: function () {
            return window.__wompiInstance;
        },
        set: function (value) {
            // Solo permitir si ya está inicializado o si tiene configuración válida
            if (value && value.initialize) {
                const originalInit = value.initialize;
                value.initialize = function (config) {
                    // Validar que tenga publicKey antes de inicializar
                    if (config && (config.publicKey || config.public_key)) {
                        window.__wompiInitialized = true;
                        console.log('✅ Wompi inicializado con configuración válida');
                        return originalInit.call(this, config);
                    } else {
                        console.warn('⚠️ Intento de inicializar Wompi sin publicKey - bloqueado');
                        return Promise.resolve();
                    }
                };
            }
            window.__wompiInstance = value;
        },
        configurable: true
    });

    // Interceptar createElement para prevenir carga de scripts no deseados de Wompi
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName, options) {
        const element = originalCreateElement.call(this, tagName, options);

        if (tagName.toLowerCase() === 'script') {
            // Interceptar cuando se establece el src
            const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
            Object.defineProperty(element, 'src', {
                set: function (value) {
                    // Si es un script de Wompi, permitir widget.js siempre y otros scripts solo si está inicializado
                    if (typeof value === 'string' && value.includes('wompi')) {
                        // Permitir siempre widget.js y scripts críticos
                        if (value.includes('widget.js') ||
                            value.includes('wompi.co/v1.js') ||
                            value.includes('checkout.wompi.co')) {
                            console.log('✅ [Global] Allowing Wompi script:', value.split('/').pop());
                            originalSrcSetter.call(this, value);
                            return;
                        }

                        // Bloquear otros scripts si no está inicializado
                        if (!window.__wompiInitialized) {
                            console.log('🚫 [Global] Blocked non-critical Wompi script:', value.split('/').pop());
                            return;
                        }
                    }
                    originalSrcSetter.call(this, value);
                },
                get: function () {
                    return this.getAttribute('src');
                }
            });
        }

        return element;
    };

    console.log('✅ Wompi Global Error Suppressor listo');
    console.log('💡 Wompi se inicializará solo cuando se configure con publicKey válida');

})();
