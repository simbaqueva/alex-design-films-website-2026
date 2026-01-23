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

    // Lista de patrones de URL a bloquear
    const blockedPatterns = [
        'feature_flags',
        'global_settings',
        'checkout_intelligence',
        'complete_api_access',
        'is_nequi_negocios',
        'enable_smart_checkout',
        'check_pco_blacklist',  // Endpoint que no existe en producción
        'merchants/undefined'
    ];

    // Interceptar fetch INMEDIATAMENTE
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        const url = args[0];

        if (typeof url === 'string') {
            // PERMITIR la carga del widget.js de Wompi
            if (url.includes('checkout.wompi.co/widget.js') ||
                url.includes('widget.js')) {
                return originalFetch.apply(this, args);
            }

            // PERMITIR llamadas importantes de Wompi
            if (url.includes('/transactions') ||
                url.includes('/payment_sources') ||
                url.includes('/tokens') ||
                url.includes('/merchants/') && !url.includes('undefined')) {
                return originalFetch.apply(this, args);
            }

            // Verificar si la URL contiene algún patrón bloqueado
            const shouldBlock = blockedPatterns.some(pattern => url.includes(pattern));

            if (shouldBlock) {
                console.log('🚫 [Global] Blocked Wompi API call:', url.split('?')[0]);
                // Retornar respuesta vacía exitosa
                return Promise.resolve(new Response(JSON.stringify({}), {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }));
            }
        }

        // Permitir todas las demás llamadas
        return originalFetch.apply(this, args);
    };

    // Interceptar XMLHttpRequest también (por si acaso)
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (typeof url === 'string') {
            const shouldBlock = blockedPatterns.some(pattern => url.includes(pattern));

            if (shouldBlock) {
                console.log('🚫 [Global] Blocked XHR call:', url.split('?')[0]);
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
            'api-sandbox.wompi.co',
            'api.wompi.co/v1/merchants/undefined',
            'Failed to load resource',
            'Uncaught (in promise)',
            'WidgetCheckout not available',
            'WidgetCheckout is not available',
            'widget.js is loaded'
        ];

        // Verificar si el mensaje debe ser suprimido
        const shouldSuppress = suppressPatterns.some(pattern =>
            message.toLowerCase().includes(pattern.toLowerCase())
        );

        if (shouldSuppress) {
            // Suprimir el error (no mostrarlo)
            console.log('🤫 [Global] Suppressed error:', message.substring(0, 100) + '...');
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
            message.includes('feature_flags') || message.includes('global_settings')) {
            console.log('🤫 [Global] Suppressed warning:', message.substring(0, 100) + '...');
            return;
        }

        originalConsoleWarn.apply(console, args);
    };

    console.log('✅ Wompi Global Error Suppressor listo');

})();
