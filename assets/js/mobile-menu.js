/**
 * ===================================
   MOBILE MENU - ALEX DESIGN FILMS
   ===================================
 * Script dedicado para el menú móvil
 */

(function () {
    'use strict';

    let menuInitialized = false;

    /**
     * Inicializar menú móvil
     */
    function initMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) {
            console.error('❌ No se pudo encontrar los elementos del menú');
            return;
        }

        if (menuInitialized) {
            return;
        }

        // Remover listeners existentes para evitar duplicados
        navToggle.removeEventListener('click', handleMenuToggle);
        navToggle.removeEventListener('touchstart', handleMenuToggle);
        navToggle.removeEventListener('keydown', handleKeyDown);

        // Event listeners principales
        navToggle.addEventListener('click', handleMenuToggle);
        navToggle.addEventListener('touchstart', handleMenuToggle, { passive: false });
        navToggle.addEventListener('keydown', handleKeyDown);

        // Cerrar menú al hacer clic en enlaces
        const links = navMenu.querySelectorAll('.nav__link');
        links.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Cerrar menú con ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('nav__menu--active')) {
                closeMenu();
            }
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function (e) {
            if (navMenu.classList.contains('nav__menu--active') &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                closeMenu();
            }
        });

        menuInitialized = true;
        console.log('✅ Menú móvil inicializado');
    }

    /**
     * Manejar toggle del menú
     */
    function handleMenuToggle(e) {
        e.preventDefault();
        e.stopPropagation();

        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) {
            console.error('❌ Elementos del menú no encontrados en toggle');
            return;
        }

        const isOpen = navMenu.classList.contains('nav__menu--active');

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /**
     * Manejar teclado
     */
    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMenuToggle(e);
        }
    }

    /**
     * Abrir menú
     */
    function openMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) return;

        navMenu.classList.add('nav__menu--active');
        navToggle.classList.add('nav__toggle--active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        // Focus en el primer enlace
        const firstLink = navMenu.querySelector('.nav__link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    /**
     * Cerrar menú
     */
    function closeMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) return;

        navMenu.classList.remove('nav__menu--active');
        navToggle.classList.remove('nav__toggle--active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        // Devolver focus al botón
        setTimeout(() => navToggle.focus(), 100);
    }

    /**
     * Inicialización cuando el DOM esté listo
     */
    function startInit() {
        // Intentar inicializar solo cuando los elementos existan
        function tryInit() {
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');

            if (navToggle && navMenu) {
                initMobileMenu();
            } else {
                // Reintentar después de un corto delay
                setTimeout(tryInit, 100);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInit);
        } else {
            tryInit();
        }
    }

    // Inicializar inmediatamente
    startInit();

    // También intentar inicializar después de que los componentes carguen
    if (window.componentsLoader) {
        document.addEventListener('components:loaded', function () {
            console.log('🔄 Components loaded event received, reinitializing mobile menu...');
            // Resetear el estado para permitir reinicialización
            menuInitialized = false;
            setTimeout(initMobileMenu, 100);
        });
    }

    // Escuchar evento de que la app está lista
    document.addEventListener('app:ready', function () {
        console.log('🔄 App ready event received, reinitializing mobile menu...');
        // Resetear el estado para permitir reinicialización
        menuInitialized = false;
        setTimeout(initMobileMenu, 100);
    });

    // Fallback: intentar después de 2 segundos
    setTimeout(initMobileMenu, 2000);

    // Fallback adicional: intentar después de 5 segundos
    setTimeout(initMobileMenu, 5000);

    // Exponer funciones globalmente para debugging
    window.mobileMenu = {
        init: initMobileMenu,
        open: openMenu,
        close: closeMenu,
        toggle: handleMenuToggle,
        isInitialized: () => menuInitialized
    };

})();
