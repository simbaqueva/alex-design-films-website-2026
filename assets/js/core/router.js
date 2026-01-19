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

        // Actualizar URL usando hash para compatibilidad con GitHub Pages
        const hash = path === 'inicio' ? '' : `#${path}`;
        window.location.hash = hash;

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

            // Inicializar componente específico (esperar a que termine)
            await this.initializeComponent(route.component);

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
            this.hideLoading(); // Asegurar que se oculte el loading en caso de error
            this.handleRoute('error');
        }
    }

    /**
     * Manejar la ruta inicial
     */
    handleInitialRoute() {
        // Leer desde hash para compatibilidad con GitHub Pages
        let path = window.location.hash.substring(1); // Remover el # inicial

        // Si está vacío, usar 'inicio'
        if (!path || path === '/') {
            path = 'inicio';
        }

        // Remover / inicial si existe
        if (path.startsWith('/')) {
            path = path.substring(1);
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

            // Limpiar el contenedor antes de insertar nuevo contenido
            this.container.innerHTML = '';

            // Insertar el HTML de manera segura
            try {
                this.container.innerHTML = html;
            } catch (domError) {
                console.error('Error setting innerHTML for component:', componentName, domError);
                // Intentar limpiar HTML potencialmente corrupto
                // En lugar de reemplazar SVGs, intentar con un enfoque más seguro
                try {
                    // Usar DOMParser para parsear HTML de forma más segura
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    // Limpiar scripts potencialmente problemáticos
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(script => script.remove());
                    this.container.innerHTML = doc.body.innerHTML;
                } catch (parseError) {
                    console.error('Error parsing HTML with DOMParser:', parseError);
                    // Fallback: insertar HTML sin scripts
                    const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                    this.container.innerHTML = cleanHtml;
                }
            }

            // Ejecutar scripts del componente
            this.executeComponentScripts(componentName);

        } catch (error) {
            console.error('Error loading component:', componentName, error);
            throw error;
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Navigation events - manejar cambios en el hash
        window.addEventListener('hashchange', (e) => {
            let path = window.location.hash.substring(1); // Remover #
            if (!path || path === '/') {
                path = 'inicio';
            }
            // Remover / inicial si existe
            if (path.startsWith('/')) {
                path = path.substring(1);
            }
            this.handleRoute(path);
        });

        // Click en enlaces internos (con # o con /)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"], a[href^="/"]');
            if (link && !link.hasAttribute('external')) {
                e.preventDefault();
                let path = link.getAttribute('href');
                // Remover # o / inicial
                if (path.startsWith('#')) {
                    path = path.substring(1);
                } else if (path.startsWith('/')) {
                    path = path.substring(1);
                }
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
            case 'payment-page.html':
                this.initPaymentPage();
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
        // Esperar un momento para que el DOM esté completamente renderizado
        await new Promise(resolve => setTimeout(resolve, 50));

        this.setupCartPageListeners();
        this.updateCartPageUI();
    }

    /**
     * Inicializar payment page
     */
    async initPaymentPage() {
        // Esperar un momento para que el DOM esté completamente renderizado
        await new Promise(resolve => setTimeout(resolve, 50));

        this.setupPaymentPageListeners();
        this.updatePaymentPageUI();
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

        // Botón de checkout - Abrir Wompi
        const checkoutBtn = document.getElementById('cart-page-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleCheckoutClick();
            });
        }

        // Escuchar cambios en el carrito
        document.addEventListener('cart:item-added', () => this.updateCartPageUI());
        document.addEventListener('cart:item-removed', () => this.updateCartPageUI());
        document.addEventListener('cart:quantity-updated', () => this.updateCartPageUI());
        document.addEventListener('cart:cart-cleared', () => this.updateCartPageUI());
    }

    /**
     * Manejar clic en botón de checkout
     */
    async handleCheckoutClick() {
        if (!window.cartManager || window.cartManager.cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        try {
            // Inicializar Wompi si no está inicializado
            if (!window.wompiIntegration) {
                // Cargar configuración
                const { default: WOMPI_CONFIG } = await import('../config/wompi-config.js');
                const { initializeWompi } = await import('../modules/wompi-integration.js');

                // Inicializar con la configuración
                window.wompiIntegration = initializeWompi(WOMPI_CONFIG.getWompiConfig());
            }

            // Obtener datos del carrito
            const summary = window.cartManager.getCartSummary();
            // Validar datos del carrito
            if (summary.total < 1) {
                alert('El total del carrito debe ser al menos $1.00 para procesar el pago.');
                return;
            }
            // Preparar datos de la orden
            const orderData = {
                total: summary.total,
                subtotal: summary.subtotal,
                tax: summary.tax,
                items: window.cartManager.cart,
                itemCount: summary.itemCount,
                // Datos del cliente (opcionales - se pueden pedir en un formulario)
                customerEmail: 'cliente@example.com',
                customerName: 'Cliente Alex Design Films',
                customerPhone: '3001234567',
                customerDocument: '1234567890'  // Documento de prueba
            };

            // Abrir checkout de Wompi
            const reference = await window.wompiIntegration.openCheckout(orderData);
            console.log('Checkout opened with reference:', reference);

        } catch (error) {
            console.error('Error opening checkout:', error);
            alert('Error al abrir la pasarela de pago. Por favor intenta nuevamente.');
        }
    }

    /**
     * Configurar event listeners para la página de pago
     */
    setupPaymentPageListeners() {
        // Configurar formulario de pago
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', this.handlePaymentForm.bind(this));
        }
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
        const checkoutBtn = document.getElementById('cart-page-checkout');

        // Verificar que los elementos existen
        if (!itemsContainer || !emptyMessage || !summaryContainer) {
            console.warn('Cart page elements not found');
            return;
        }

        if (cart.length === 0) {
            // Mostrar mensaje vacío
            itemsContainer.style.display = 'none';
            emptyMessage.style.display = 'flex';
            summaryContainer.style.display = 'none';

            // Ocultar botón de pago cuando no hay productos
            if (checkoutBtn) {
                checkoutBtn.style.display = 'none';
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

            // Mostrar botón de pago cuando hay productos
            if (checkoutBtn) {
                checkoutBtn.style.display = 'flex';
            }

            // Generar HTML de los items
            const itemsHTML = cart.map(item => `
                <div class="cart-page-item">
                    <div class="cart-page-item__image">
                        <div class="cart-page-item__placeholder">
                            📦
                        </div>
                    </div>
                    <div class="cart-page-item__info">
                        <h3 class="cart-page-item__name">${item.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                        <p class="cart-page-item__price">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-page-item__quantity">
                        <button class="cart-page-item__quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">
                            −
                        </button>
                        <span class="cart-page-item__quantity-value">${item.quantity}</span>
                        <button class="cart-page-item__quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">
                            +
                        </button>
                        <button class="cart-page-item__remove" onclick="window.cartManager.removeFromCart('${item.id}')">
                            ×
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
     * Actualizar UI de la página de pago
     */
    async updatePaymentPageUI() {
        if (!window.cartManager) {
            console.warn('Cart manager not available for payment page');
            return;
        }

        const cart = window.cartManager.cart;
        const summaryContent = document.getElementById('payment-summary-content');
        const summaryTotals = document.getElementById('payment-summary-totals');
        const paymentMethodsContent = document.getElementById('payment-methods-content');

        // Verificar que hay productos en el carrito
        if (!cart || cart.length === 0) {
            // Redirigir al carrito si está vacío
            this.navigate('carrito');
            return;
        }

        // Generar resumen del pedido
        const itemsHTML = cart.map(item => `
            <div class="payment-summary-item">
                <div class="payment-summary-item__info">
                    <h4 class="payment-summary-item__name">${item.name}</h4>
                    <span class="payment-summary-item__quantity">Cantidad: ${item.quantity}</span>
                </div>
                <span class="payment-summary-item__price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        if (summaryContent) {
            summaryContent.innerHTML = itemsHTML;
        }

        // Generar totales
        const subtotal = window.cartManager.calculateSubtotal();
        const tax = window.cartManager.calculateTax();
        const total = subtotal + tax;

        const totalsHTML = `
            <div class="payment-totals">
                <div class="payment-totals__item">
                    <span class="payment-totals__label">Subtotal:</span>
                    <span class="payment-totals__value">$${subtotal.toFixed(2)}</span>
                </div>
                <div class="payment-totals__item">
                    <span class="payment-totals__label">Impuestos (19%):</span>
                    <span class="payment-totals__value">$${tax.toFixed(2)}</span>
                </div>
                <div class="payment-totals__item payment-totals__item--total">
                    <span class="payment-totals__label">Total:</span>
                    <span class="payment-totals__value">$${total.toFixed(2)}</span>
                </div>
            </div>
        `;

        if (summaryTotals) {
            summaryTotals.innerHTML = totalsHTML;
        }
    }



    /**
     * Manejar envío del formulario de pago
     */
    async handlePaymentForm(e) {
        e.preventDefault();

        // TODO: Implementar integración de pagos
        console.log('Payment form submitted - payment integration needed');
        this.showPaymentError('La integración de pagos aún no está configurada');
    }

    /**
     * Mostrar loading en el formulario de pago
     */
    showPaymentLoading(loading) {
        const submitBtn = document.getElementById('payment-submit-btn');
        const spinner = submitBtn?.querySelector('.payment-form__spinner');
        const text = submitBtn?.querySelector('.payment-form__submit-text');

        if (submitBtn) {
            submitBtn.disabled = loading;
        }

        if (spinner) {
            spinner.style.display = loading ? 'inline-block' : 'none';
        }

        if (text) {
            text.textContent = loading ? 'Procesando...' : 'Procesar Pago';
        }
    }

    /**
     * Mostrar error en la página de pago
     */
    showPaymentError(message) {
        const statusContainer = document.getElementById('payment-status');
        const statusContent = document.getElementById('payment-status-content');

        if (statusContainer && statusContent) {
            statusContent.innerHTML = `
                <div class="payment-error">
                    <h3>Error en el pago</h3>
                    <p>${message}</p>
                    <button onclick="document.getElementById('payment-status').style.display='none'" class="payment-error__close">
                        Cerrar
                    </button>
                </div>
            `;
            statusContainer.style.display = 'block';
        } else {
            alert('Error: ' + message);
        }
    }

    /**
     * Mostrar éxito en la página de pago
     */
    showPaymentSuccess(message, redirectTo = 'tienda') {
        const statusContainer = document.getElementById('payment-status');
        const statusContent = document.getElementById('payment-status-content');

        if (statusContainer && statusContent) {
            statusContent.innerHTML = `
                <div class="payment-success">
                    <h3>¡Pago exitoso!</h3>
                    <p>${message}</p>
                    <button onclick="window.router.navigate('${redirectTo}')" class="payment-success__continue">
                        Continuar
                    </button>
                </div>
            `;
            statusContainer.style.display = 'block';

            // Vaciar carrito después de 2 segundos
            setTimeout(() => {
                if (window.cartManager) {
                    window.cartManager.clearCart();
                }
                setTimeout(() => {
                    this.navigate(redirectTo);
                }, 1000);
            }, 2000);
        } else {
            alert('¡Pago exitoso! ' + message);
            if (window.cartManager) {
                window.cartManager.clearCart();
            }
            this.navigate(redirectTo);
        }
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
                // El carrito ya debería estar cargado globalmente por components-loader
                // pero verificamos si existe
                if (window.componentsLoader && window.componentsLoader.isComponentLoaded('cart-component')) {
                    const cartHTML = window.componentsLoader.getComponent('cart-component');
                    if (cartHTML) {
                        cartContainer.innerHTML = cartHTML;
                    }
                } else {
                    // Fallback: cargar directamente
                    const response = await fetch('./assets/components/cart-component.html');
                    if (!response.ok) throw new Error('Cart component not found');
                    const cartHTML = await response.text();
                    cartContainer.innerHTML = cartHTML;
                }

                // Inicializar el carrito si no existe
                if (!window.cartManager) {
                    const { initializeCart } = await import('../modules/cart.js');
                    window.cartManager = initializeCart();
                } else {
                    // Reconfigurar event listeners y actualizar UI
                    window.cartManager.setupEventListeners();
                    window.cartManager.updateCartUI();
                }
            } else if (window.cartManager) {
                // Si el contenedor ya tiene contenido, solo actualizar la UI
                window.cartManager.updateCartUI();
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

router.register('pago', 'payment-page.html', {
    title: 'Pago - Álvaro Alexander',
    description: 'Procesar pago de tu pedido.'
});

router.register('confirmacion', 'confirmation-page.html', {
    title: 'Confirmación - Álvaro Alexander',
    description: 'Confirmación de tu pedido.'
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
