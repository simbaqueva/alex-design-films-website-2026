/**
 * ===================================
   ROUTER - ALEX DESIGN FILMS SPA
   ===================================
 * Sistema de routing para Single Page Application
 */

export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.container = null;
        this.componentCache = new Map();
        this.init();
    }

    /**
     * Inicializar router
     */
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupRouter());
        } else {
            this.setupRouter();
        }
    }

    /**
     * Configurar router
     */
    setupRouter() {
        this.container = document.getElementById('app-container');
        this.setupEventListeners();

        // Pre-cargar componentes en segundo plano
        this.preloadComponents();

        // No forzar ruta inicial, solo manejar la ruta actual
        // Pequeño retardo para asegurar que todo esté cargado
        setTimeout(() => {
            this.handleInitialRoute();
        }, 100);
    }

    /**
     * Registrar una nueva ruta
     */
    register(path, component, metadata = {}) {
        this.routes.set(path, {
            component,
            title: metadata.title || path,
            description: metadata.description || '',
            ...metadata
        });
    }

    /**
     * Navegar a una ruta
     */
    navigate(path) {
        // Limpiar el path
        if (path.startsWith('#')) {
            path = path.substring(1);
        }
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        if (!path) {
            path = 'inicio';
        }

        // Actualizar URL sin recargar la página usando History API
        const url = path === 'inicio' ? '/' : `/${path}`;
        window.history.pushState({ path }, '', url);

        // Manejar la ruta
        this.handleRoute(path);
    }

    /**
     * Manejar una ruta específica
     */
    async handleRoute(path) {
        try {
            // Si la ruta no existe, usar 404
            if (!this.routes.has(path)) {
                if (path !== '404') {
                    this.handleRoute('404');
                }
                return;
            }

            const route = this.routes.get(path);
            const isInitialLoad = this.currentRoute === null;
            this.currentRoute = path;

            // Solo mostrar loading en carga inicial, no en navegación
            if (isInitialLoad) {
                this.showLoading();
            }

            // Cargar el componente (instantáneo si está en caché)
            await this.loadComponent(route.component, path);

            // Actualizar metadatos
            this.updateMetadata(route);

            // Actualizar navegación activa
            this.updateActiveNavigation(path);

            // Inicializar componente específico
            this.initializeComponent(route.component);

            // Solo ocultar loading si se mostró
            if (isInitialLoad) {
                this.hideLoading();
            }

            // Animar entrada solo si no es carga inicial
            if (!isInitialLoad) {
                this.animateComponentEntry();
            }

            // Disparar evento
            this.dispatchRouteEvent(path, route);

        } catch (error) {
            console.error('Error handling route:', error);
            this.handleRoute('error');
        }
    }

    /**
     * Manejar la ruta inicial
     */
    handleInitialRoute() {
        // Leer desde pathname en lugar de hash
        let path = window.location.pathname.substring(1); // Remover el / inicial

        // Si está vacío o es solo /, usar 'inicio'
        if (!path || path === '/') {
            path = 'inicio';
        }

        if (this.routes.has(path)) {
            this.handleRoute(path);
        } else {
            this.handleRoute('inicio');
        }
    }

    /**
     * Cargar componente para una ruta
     */
    async loadComponent(componentName, path) {
        try {
            let html;
            if (this.componentCache.has(componentName)) {
                html = this.componentCache.get(componentName);
            } else {
                const response = await fetch(`./assets/components/${componentName}`);
                if (!response.ok) {
                    throw new Error(`Component ${componentName} not found`);
                }
                html = await response.text();
                this.componentCache.set(componentName, html);
            }

            this.container.innerHTML = html;

            // Ejecutar scripts del componente
            this.executeComponentScripts(componentName);

        } catch (error) {
            console.error('Error loading component:', error);
            throw error;
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Navigation events - manejar botones atrás/adelante
        window.addEventListener('popstate', (e) => {
            let path = window.location.pathname.substring(1);
            if (!path || path === '/') {
                path = 'inicio';
            }
            this.handleRoute(path);
        });

        // Click en enlaces internos (sin #, enlaces normales)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"]');
            if (link && !link.hasAttribute('external')) {
                e.preventDefault();
                const path = link.getAttribute('href').substring(1); // Remover /
                this.navigate(path);
            }
        });
    }

    /**
     * Pre-cargar todos los componentes
     */
    async preloadComponents() {
        const componentPromises = Array.from(this.routes.values()).map(route =>
            this.loadAndCacheComponent(route.component)
        );

        try {
            await Promise.all(componentPromises);
            console.log('Todos los componentes pre-cargados');
        } catch (error) {
            console.error('Error pre-cargando componentes:', error);
        }
    }

    /**
     * Cargar y cachear componente
     */
    async loadAndCacheComponent(componentName) {
        if (this.componentCache.has(componentName)) return;

        try {
            const response = await fetch(`./assets/components/${componentName}`);
            if (response.ok) {
                const html = await response.text();
                this.componentCache.set(componentName, html);
            }
        } catch (error) {
            console.error('Error preloading component:', componentName, error);
        }
    }



    /**
     * Ejecutar scripts del componente
     */
    executeComponentScripts(componentName) {
        const scripts = this.container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
        });
    }

    /**
     * Inicializar componente específico
     */
    async initializeComponent(componentName) {
        // Inicializaciones específicas por componente
        switch (componentName) {
            case 'hero-section.html':
                this.initHeroSection();
                break;
            case 'services-section.html':
                this.initServicesSection();
                break;
            case 'shop-section.html':
                this.initShopSection();
                await this.loadCartComponent();
                break;
            case 'ai-agents-section.html':
                this.initAIAgentsSection();
                break;
            case 'tutorials-section.html':
                this.initTutorialsSection();
                break;
            case 'contact-section.html':
                this.initContactSection();
                break;
            case 'cart-page.html':
                this.initCartPage();
                break;
        }

        // Reinicializar observadores
        this.reinitializeObservers();
    }

    /**
     * Inicializar hero section
     */
    initHeroSection() {
        // Animaciones específicas del hero
        const heroContent = this.container.querySelector('.hero__content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.classList.add('animate-fade-in-up');
            }, 100);
        }
    }

    /**
     * Inicializar services section
     */
    initServicesSection() {
        // Animar cards de servicios
        const serviceCards = this.container.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-fade-in-up');
            }, index * 100);
        });
    }

    /**
     * Inicializar shop section
     */
    initShopSection() {
        // Animar productos
        const productCards = this.container.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-fade-in-up');
            }, index * 100);
        });
    }



    /**
     * Inicializar AI agents section
     */
    initAIAgentsSection() {
        // Animar agentes
        const agentCards = this.container.querySelectorAll('.agent-card');
        agentCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-fade-in-up');
            }, index * 100);
        });
    }

    /**
     * Inicializar tutorials section
     */
    initTutorialsSection() {
        // Animar tutoriales
        const tutorialCards = this.container.querySelectorAll('.tutorial-card');
        tutorialCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-fade-in-up');
            }, index * 100);
        });
    }

    /**
     * Inicializar contact section
     */
    initContactSection() {
        // Configurar formulario de contacto
        const contactForm = this.container.querySelector('#contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }

        // Configurar formulario de newsletter
        const newsletterForm = this.container.querySelector('#newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', this.handleNewsletterForm.bind(this));
        }
    }

    /**
     * Inicializar cart page
     */
    async initCartPage() {
        this.setupCartPageListeners();
        await this.initializeBoldPayment();
        this.updateCartPageUI();
    }

    /**
     * Inicializar integración de Bold Payment
     */
    async initializeBoldPayment() {
        try {
            // Importar el módulo de Bold Payment
            const { initializeBoldPayment, getBoldPaymentIntegration } = await import('../modules/bold-payment.js');

            // Inicializar con tu API Key de Bold
            // IMPORTANTE: Reemplaza 'YOUR_BOLD_API_KEY' con tu API Key real
            const apiKey = 'YOUR_BOLD_API_KEY'; // TODO: Configurar API Key real

            await initializeBoldPayment(apiKey);

            // Guardar referencia global
            window.boldPaymentIntegration = getBoldPaymentIntegration();

            console.log('✅ Bold payment integration initialized');
        } catch (error) {
            console.error('❌ Error initializing Bold payment:', error);
        }
    }

    /**
     * Configurar event listeners para la página del carrito
     */
    setupCartPageListeners() {
        // Botón de vaciar carrito
        const clearBtn = document.getElementById('cart-page-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.cartManager) {
                    window.cartManager.clearCart();
                    this.updateCartPageUI();
                }
            });
        }

        // Escuchar cambios en el carrito
        document.addEventListener('cart:item-added', () => this.updateCartPageUI());
        document.addEventListener('cart:item-removed', () => this.updateCartPageUI());
        document.addEventListener('cart:quantity-updated', () => this.updateCartPageUI());
        document.addEventListener('cart:cart-cleared', () => this.updateCartPageUI());
    }

    /**
     * Actualizar UI de la página del carrito
     */
    async updateCartPageUI() {
        if (!window.cartManager) return;

        const cart = window.cartManager.cart;
        const itemsContainer = document.getElementById('cart-page-items');
        const emptyMessage = document.getElementById('cart-page-empty');
        const summaryContainer = document.getElementById('cart-page-summary');
        const subtotalElement = document.getElementById('cart-page-subtotal');
        const taxElement = document.getElementById('cart-page-tax');
        const totalElement = document.getElementById('cart-page-total');
        const navBadge = document.getElementById('nav-cart-count');

        if (cart.length === 0) {
            // Mostrar mensaje vacío
            itemsContainer.style.display = 'none';
            emptyMessage.style.display = 'flex';
            summaryContainer.style.display = 'none';

            // Ocultar botón de Bold
            if (window.boldPaymentIntegration) {
                window.boldPaymentIntegration.hidePaymentButton();
            }

            // Actualizar badge del navbar
            if (navBadge) {
                navBadge.textContent = '0';
                navBadge.style.display = 'none';
            }
        } else {
            // Mostrar productos y resumen
            itemsContainer.style.display = 'grid';
            emptyMessage.style.display = 'none';
            summaryContainer.style.display = 'block';

            // Generar HTML de los items con SVG corregidos
            const itemsHTML = cart.map(item => `
                <div class="cart-page-item">
                    <div class="cart-page-item__image">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                        </svg>
                    </div>
                    <div class="cart-page-item__info">
                        <h3 class="cart-page-item__name">${item.name}</h3>
                        <p class="cart-page-item__price">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-page-item__quantity">
                        <button class="cart-page-item__quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13H5v-2h14v2z"/>
                            </svg>
                        </button>
                        <span class="cart-page-item__quantity-value">${item.quantity}</span>
                        <button class="cart-page-item__quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                        </button>
                        <button class="cart-page-item__remove" onclick="window.cartManager.removeFromCart('${item.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

            itemsContainer.innerHTML = itemsHTML;

            // Calcular y mostrar totales
            const subtotal = window.cartManager.calculateSubtotal();
            const tax = window.cartManager.calculateTax();
            const total = subtotal + tax;

            if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
            if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
            if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;

            // Actualizar badge del navbar
            if (navBadge) {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                navBadge.textContent = totalItems;
                navBadge.style.display = totalItems > 0 ? 'flex' : 'none';
            }

            // Actualizar botón de Bold Payment
            if (window.boldPaymentIntegration) {
                const cartData = {
                    items: cart,
                    subtotal: subtotal,
                    tax: tax,
                    total: total,
                    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
                };

                await window.boldPaymentIntegration.updatePaymentButton(cartData);
            }
        }
    }

    /**
     * Manejar formulario de contacto
     */
    async handleContactForm(e) {
        e.preventDefault();
        // Lógica del formulario existente
        console.log('Contact form submitted');
    }

    /**
     * Manejar formulario de newsletter
     */
    async handleNewsletterForm(e) {
        e.preventDefault();
        // Lógica del newsletter existente
        console.log('Newsletter form submitted');
    }

    /**
     * Reinicializar observadores
     */
    reinitializeObservers() {
        // Disparar evento para que la app principal reinicialice observadores
        document.dispatchEvent(new CustomEvent('route:changed', {
            detail: { path: this.currentRoute }
        }));
    }

    /**
     * Animar entrada del componente
     */
    animateComponentEntry() {
        const container = this.container;

        // Animación más rápida y suave
        container.style.opacity = '0';
        container.style.transform = 'translateY(10px)';

        requestAnimationFrame(() => {
            container.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        });
    }

    /**
     * Actualizar metadatos
     */
    updateMetadata(route) {
        document.title = route.title;

        // Actualizar meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = route.description;
        }

        // Actualizar Open Graph
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.content = route.title;
        }

        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.content = route.description;
        }
    }

    /**
     * Actualizar navegación activa
     */
    updateActiveNavigation(path) {
        // Limpiar estados activos
        document.querySelectorAll('.nav__link').forEach(link => {
            link.classList.remove('nav__link--active');
        });

        // Establecer estado activo - buscar por href con /
        const activeLink = document.querySelector(`.nav__link[href="/${path}"]`);
        if (activeLink) {
            activeLink.classList.add('nav__link--active');
        }

        // Limpiar carrito si no estamos en tienda
        if (this.currentRoute === 'tienda' && path !== 'tienda') {
            this.unloadCartComponent();
        }
    }

    /**
     * Cargar componente del carrito
     */
    async loadCartComponent() {
        try {
            const cartContainer = document.getElementById('cart-container');
            if (cartContainer && !cartContainer.innerHTML.trim()) {
                const response = await fetch('./assets/components/cart-component.html');
                if (!response.ok) throw new Error('Cart component not found');
                const cartHTML = await response.text();
                cartContainer.innerHTML = cartHTML;

                // Inicializar el carrito si no existe
                if (!window.cartManager) {
                    const { initializeCart } = await import('../modules/cart.js');
                    window.cartManager = initializeCart();
                } else {
                    // Reconfigurar event listeners y actualizar UI
                    window.cartManager.setupEventListeners();
                    window.cartManager.updateCartUI();
                }
            }
        } catch (error) {
            console.error('Error loading cart component:', error);
        }
    }

    /**
     * Descargar componente del carrito
     */
    unloadCartComponent() {
        const cartContainer = document.getElementById('cart-container');
        if (cartContainer) {
            cartContainer.innerHTML = '';
        }
    }

    /**
     * Mostrar loading
     */
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            loadingScreen.style.visibility = 'visible';
        }
    }

    /**
     * Ocultar loading
     */
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Disparar evento de ruta
     */
    dispatchRouteEvent(path, route) {
        document.dispatchEvent(new CustomEvent('route:loaded', {
            detail: { path, route }
        }));
    }

    /**
     * Obtener ruta actual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Obtener todas las rutas
     */
    getRoutes() {
        return Array.from(this.routes.keys());
    }
}

// Crear instancia global del router
export const router = new Router();

// Registrar rutas por defecto
router.register('inicio', 'hero-section.html', {
    title: 'Inicio - Álvaro Alexander',
    description: 'Desarrollador profesional especializado en programación, branding, VFX, marketing digital y creación de agentes de IA.'
});

router.register('servicios', 'services-section.html', {
    title: 'Servicios - Álvaro Alexander',
    description: 'Servicios profesionales de desarrollo web, branding, VFX, marketing digital y más.'
});

router.register('tienda', 'shop-section.html', {
    title: 'Tienda - Álvaro Alexander',
    description: 'Productos digitales y servicios premium para tu negocio.'
});

router.register('agentes-ia', 'ai-agents-section.html', {
    title: 'Agentes IA - Álvaro Alexander',
    description: 'Agentes de inteligencia artificial personalizados para automatizar tus procesos.'
});

router.register('tutoriales', 'tutorials-section.html', {
    title: 'Tutoriales - Álvaro Alexander',
    description: 'Tutoriales profesionales de programación, diseño y marketing digital.'
});

router.register('contacto', 'contact-section.html', {
    title: 'Contacto - Álvaro Alexander',
    description: 'Contacta conmigo para tu próximo proyecto digital.'
});

router.register('carrito', 'cart-page.html', {
    title: 'Carrito - Álvaro Alexander',
    description: 'Gestiona tus productos seleccionados.'
});

// Rutas de error
router.register('404', 'error-404.html', {
    title: 'Página no encontrada - Álvaro Alexander',
    description: 'La página que buscas no existe.'
});

router.register('error', 'error.html', {
    title: 'Error - Álvaro Alexander',
    description: 'Ha ocurrido un error inesperado.'
});

export default router;
