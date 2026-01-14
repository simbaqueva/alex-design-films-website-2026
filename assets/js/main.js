/**
 * ===================================
   MAIN JAVASCRIPT - ALEX DESIGN FILMS
   ===================================
 * Punto de entrada principal de la aplicación modular
 */

// Importar módulos principales
import { initializeApp } from './core/app.js';
import { initializeCart } from './modules/cart.js';
import { initializeNotifications } from './modules/notifications.js';
import { router } from './core/router.js';

// Importar el components-loader actualizado
import './components-loader.js';

/**
 * Inicialización principal de la aplicación
 */
async function main() {
    try {
        console.log('🎬 Starting Alex Design Films Application...');
        
        // Inicializar componentes legacy si existen
        if (window.componentsLoader) {
            await window.componentsLoader.preloadAllComponents();
            window.componentsLoader.initializeComponents();
            
            // Esperar un poco más para asegurar que el DOM esté completamente actualizado
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Inicializar aplicación principal
        await initializeApp();
        
        // Inicializar módulos adicionales (evitar múltiples inicializaciones)
        if (!window.cartManager) {
            await initializeCart();
        }
        if (!window.notificationManager) {
            await initializeNotifications();
        }
        
        // Mostrar mensaje de bienvenida en desarrollo
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('%c🚀 Alex Design Films - Development Mode', 
                'color: #4CAF50; font-size: 16px; font-weight: bold;');
            console.log('%cModular Architecture Loaded Successfully!', 
                'color: #2196F3; font-size: 14px;');
        }
        
        // Disparar evento de que todo está listo
        document.dispatchEvent(new CustomEvent('app:ready', {
            detail: {
                timestamp: Date.now(),
                modules: ['app', 'cart', 'notifications', 'components']
            }
        }));
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        
        // Mostrar error crítico al usuario
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #000000 0%, #101a24 50%, #000000 100%);
                color: white;
                font-family: 'Inter', sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">
                        Error Crítico
                    </h1>
                    <p style="font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8;">
                        No se pudo inicializar la aplicación correctamente.
                    </p>
                    <p style="font-size: 0.9rem; margin-bottom: 2rem; opacity: 0.6;">
                        Por favor, recarga la página o contacta al soporte.
                    </p>
                    <button onclick="location.reload()" style="
                        background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
                        color: black;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        Recargar Página
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Manejar errores de carga de módulos
 */
window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes('.js')) {
        console.error('Module loading error:', {
            file: event.filename,
            line: event.lineno,
            column: event.colno,
            error: event.error
        });
    }
});

/**
 * Manejar errores de importación dinámica
 */
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
        console.error('Dynamic import failed:', event.reason);
    }
});

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

// Exportar para uso en otros scripts
export { main };

// Hacer disponibles globalmente para compatibilidad
window.alexDesignApp = {
    main,
    initializeApp,
    initializeCart,
    initializeNotifications
};

console.log('📦 Main entry point loaded');