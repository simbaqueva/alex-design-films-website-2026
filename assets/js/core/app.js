/**
 * ===================================
   MAIN APP - ALEX DESIGN FILMS
   ===================================
 * Aplicación principal modular
 */

import { Helpers } from '../utils/helpers.js';
import { NotificationManager, getNotificationManager } from '../modules/notifications.js';
import { CartManager, getCartManager } from '../modules/cart.js';

/**
 * Clase principal de la aplicación
 */
export class AlexDesignApp {
    constructor() {
        this.isLoaded = false;
        this.sections = [];
        this.currentSection = null;
        this.notificationManager = null;
        this.cartManager = null;
        this.modules = new Map();
        this.observers = new Map();
        this.init();
    }

    /**
     * Inicialización de la aplicación
     */
    async init() {
        try {
            console.log('🚀 Initializing Alex Design Films App...');

            // Inicializar módulos principales
            await this.initializeModules();

            // Configurar event listeners globales
            this.setupEventListeners();

            // Configurar observadores
            this.setupObservers();

            // Configurar navegación
            this.setupNavigation();

            // Configurar formularios
            this.setupForms();

            // Configurar animaciones
            this.setupAnimations();

            // Configurar accesibilidad
            this.setupAccessibility();

            // Configurar performance monitoring
            this.setupPerformanceMonitoring();

            this.isLoaded = true;
            console.log('✅ Alex Design Films App initialized successfully');

            // Disparar evento de inicialización
            this.dispatchAppEvent('app:initialized');

        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.handleCriticalError(error);
        }
    }

    /**
     * Inicializar módulos
     */
    async initializeModules() {
        // Inicializar gestor de notificaciones
        this.notificationManager = getNotificationManager();
        this.modules.set('notifications', this.notificationManager);

        // Inicializar gestor del carrito
        this.cartManager = getCartManager();
        this.modules.set('cart', this.cartManager);

        // Esperar que los módulos estén listos
        await this.waitForModulesReady();
    }

    /**
     * Esperar que los módulos estén listos
     */
    async waitForModulesReady() {
        const maxWaitTime = 5000; // 5 segundos máximo
        const checkInterval = 100; // Revisar cada 100ms
        let waitTime = 0;

        while (waitTime < maxWaitTime) {
            const allReady = Array.from(this.modules.values()).every(module => {
                return module && typeof module === 'object';
            });

            if (allReady) {
                return true;
            }

            await Helpers.wait(checkInterval);
            waitTime += checkInterval;
        }

        throw new Error('Timeout waiting for modules to be ready');
    }

    /**
     * Configurar event listeners globales
     */
    setupEventListeners() {
        // Navigation events
        document.addEventListener('scroll', Helpers.throttle(() => this.handleScroll(), 16));

        // Resize events
        window.addEventListener('resize', Helpers.debounce(() => this.handleResize(), 250));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        // Online/Offline
        window.addEventListener('online', () => this.handleConnectivityChange(true));
        window.addEventListener('offline', () => this.handleConnectivityChange(false));

        // Error handling
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handleUnhandledRejection(e));

        // Custom events del carrito
        document.addEventListener('cart:item-added', (e) => this.handleCartEvent(e));
        document.addEventListener('cart:item-removed', (e) => this.handleCartEvent(e));
        document.addEventListener('cart:purchase-completed', (e) => this.handleCartEvent(e));
    }

    /**
     * Configurar observadores
     */
    setupObservers() {
        // Intersection Observer para animaciones
        this.observers.set('animation', this.createAnimationObserver());

        // Intersection Observer para lazy loading
        this.observers.set('lazyLoad', this.createLazyLoadObserver());

        // Resize Observer para responsive
        this.observers.set('resize', this.createResizeObserver());

        // Mutation Observer para cambios dinámicos
        this.observers.set('mutation', this.createMutationObserver());
    }

    /**
     * Crear observer para animaciones
     */
    createAnimationObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observar elementos animables
        this.observeAnimatedElements(observer);

        return observer;
    }

    /**
     * Crear observer para lazy loading
     */
    createLazyLoadObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observar elementos con lazy loading
        this.observeLazyElements(observer);

        return observer;
    }

    /**
     * Crear Resize Observer
     */
    createResizeObserver() {
        if (typeof ResizeObserver === 'undefined') return null;

        const observer = new ResizeObserver((entries) => {
            entries.forEach(entry => {
                this.handleElementResize(entry.target, entry.contentRect);
            });
        });

        // Observar elementos que necesitan responsive
        this.observeResizableElements(observer);

        return observer;
    }

    /**
     * Crear Mutation Observer
     */
    createMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                this.handleDOMMutation(mutation);
            });
        });

        // Observar cambios en el DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-animate']
        });

        return observer;
    }

    /**
     * Configurar navegación
     */
    setupNavigation() {
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Active state en navegación
        this.updateNavigationActiveState();

        // Esperar a que los componentes estén cargados antes de configurar el menú móvil
        this.waitForComponentsAndSetupMobileMenu();
    }

    /**
     * Esperar a que los componentes estén cargados y configurar menú móvil
     */
    async waitForComponentsAndSetupMobileMenu() {
        console.log('⏳ Esperando componentes para configurar menú móvil...');

        // Escuchar el evento de que los componentes están listos
        document.addEventListener('components:loaded', () => {
            console.log('📦 Evento components:loaded recibido');
            this.setupMobileMenuWithRetry();
        });

        // También intentar configurar después de un delay como fallback
        setTimeout(() => {
            this.setupMobileMenuWithRetry();
        }, 2000);
    }

    /**
     * Configurar menú móvil con reintentos
     */
    setupMobileMenuWithRetry() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            console.log('✅ Componentes encontrados, configurando menú móvil...');
            this.setupMobileMenu();
        } else {
            console.log('⏳ Componentes aún no disponibles, reintentando...');
            // Reintentar después de un corto delay
            setTimeout(() => {
                this.setupMobileMenuWithRetry();
            }, 500);
        }
    }

    /**
     * Configurar formularios
     */
    setupForms() {
        // Formulario de contacto
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Formulario de newsletter
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterForm(e));
        }

        // Validación en tiempo real
        this.setupRealTimeValidation();
    }

    /**
     * Configurar validación en tiempo real
     */
    setupRealTimeValidation() {
        // Validación de nombre
        const nameInputs = document.querySelectorAll('input[name="name"]');
        nameInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateNameField(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.validateNameField(e.target);
            });
        });

        // Validación de email
        const emailInputs = document.querySelectorAll('input[type="email"], input[name="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateEmailField(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.validateEmailField(e.target);
            });
        });

        // Validación de mensaje
        const messageTextareas = document.querySelectorAll('textarea[name="message"]');
        messageTextareas.forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                this.validateMessageField(e.target);
            });

            textarea.addEventListener('blur', (e) => {
                this.validateMessageField(e.target);
            });
        });

        // Validación de teléfono (si existe)
        const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validatePhoneField(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.validatePhoneField(e.target);
            });
        });
    }

    /**
     * Validar campo de nombre
     */
    validateNameField(field) {
        const value = field.value.trim();
        const isValid = value.length >= 2 && value.length <= 100;

        this.updateFieldValidation(field, isValid, isValid ? 'El nombre es válido' : 'El nombre debe tener entre 2 y 100 caracteres');

        return isValid;
    }

    /**
     * Validar campo de email
     */
    validateEmailField(field) {
        const value = field.value.trim();
        const isValid = Helpers.validateEmail(value);

        this.updateFieldValidation(field, isValid, isValid ? 'El email es válido' : 'Por favor, ingresa un email válido');

        return isValid;
    }

    /**
     * Validar campo de mensaje
     */
    validateMessageField(field) {
        const value = field.value.trim();
        const isValid = value.length >= 10 && value.length <= 1000;

        this.updateFieldValidation(field, isValid, isValid ? 'El mensaje es válido' : 'El mensaje debe tener entre 10 y 1000 caracteres');

        return isValid;
    }

    /**
     * Validar campo de teléfono
     */
    validatePhoneField(field) {
        const value = field.value.trim();
        // Permitir formatos internacionales básicos
        const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
        const isValid = !value || phoneRegex.test(value);

        this.updateFieldValidation(field, isValid, isValid ? 'El teléfono es válido' : 'Por favor, ingresa un teléfono válido');

        return isValid;
    }

    /**
     * Actualizar estado de validación de campo
     */
    updateFieldValidation(field, isValid, message) {
        // Remover estados anteriores
        field.classList.remove('field-valid', 'field-invalid');

        // Remover mensaje de error anterior
        const existingMessage = field.parentNode.querySelector('.field-validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Añadir nuevo estado
        if (field.value.trim().length > 0) {
            if (isValid) {
                field.classList.add('field-valid');
            } else {
                field.classList.add('field-invalid');

                // Crear y añadir mensaje de error
                const messageElement = document.createElement('div');
                messageElement.className = 'field-validation-message';
                messageElement.textContent = message;
                field.parentNode.appendChild(messageElement);
            }
        }

        // Actualizar ARIA
        field.setAttribute('aria-invalid', !isValid);
        if (!isValid && message) {
            field.setAttribute('aria-describedby', `${field.id}-error`);
            messageElement.id = `${field.id}-error`;
        } else {
            field.removeAttribute('aria-describedby');
        }
    }

    /**
     * Configurar animaciones
     */
    setupAnimations() {
        // Animación de entrada para hero
        const heroContent = document.querySelector('.hero__content');
        if (heroContent) {
            Helpers.wait(100).then(() => {
                heroContent.classList.add('fade-in-up');
            });
        }

        // Parallax effect
        this.setupParallaxEffects();

        // Microinteracciones
        this.setupMicroInteractions();
    }

    /**
     * Configurar accesibilidad
     */
    setupAccessibility() {
        // Skip links
        this.setupSkipLinks();

        // Focus management
        this.setupFocusManagement();

        // ARIA labels dinámicos
        this.setupARIALabels();

        // Reducir motion si el usuario prefiere
        this.setupReducedMotion();
    }

    /**
     * Configurar monitoreo de performance
     */
    setupPerformanceMonitoring() {
        // Monitorizar tiempo de carga
        if ('performance' in window) {
            window.addEventListener('load', () => {
                this.logPerformanceMetrics();
            });
        }

        // Monitorizar memoria si está disponible
        if ('memory' in performance) {
            this.monitorMemoryUsage();
        }
    }

    /**
     * Manejar scroll
     */
    handleScroll() {
        this.updateNavigationActiveState();
        this.handleHeaderScroll();
        this.updateScrollProgress();
    }

    /**
     * Manejar resize
     */
    handleResize() {
        this.handleResponsiveChanges();
        this.updateViewportMeta();
    }

    /**
     * Manejar keyboard
     */
    handleKeyboard(e) {
        // Shortcuts globales
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    // Focus en búsqueda si existe
                    const searchInput = document.querySelector('input[type="search"]');
                    searchInput?.focus();
                    break;
                case '/':
                    e.preventDefault();
                    // Abrir comandos si existe
                    this.openCommandPalette?.();
                    break;
            }
        }

        // ESC para cerrar modales
        if (e.key === 'Escape') {
            this.closeAllModals();
        }

        // Tab navigation improvement
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }
    }

    /**
     * Manejar cambios de visibilidad
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animaciones y videos
            this.pauseMedia();
        } else {
            // Reanudar animaciones y videos
            this.resumeMedia();
        }
    }

    /**
     * Manejar cambios de conectividad
     */
    handleConnectivityChange(isOnline) {
        const message = isOnline
            ? 'Conexión restablecida'
            : 'Conexión perdida. Algunas funciones pueden no estar disponibles.';

        this.notificationManager[isOnline ? 'success' : 'warning'](message);

        // Sincronizar datos cuando vuelve la conexión
        if (isOnline) {
            this.syncOfflineData();
        }
    }

    /**
     * Manejar errores globales
     */
    handleGlobalError(event) {
        console.error('Global error:', event.error);
        this.notificationManager.error('Ha ocurrido un error inesperado');

        // Enviar a servicio de reporte de errores si está configurado
        this.reportError?.(event.error);
    }

    /**
     * Manejar promesas rechazadas
     */
    handleUnhandledRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.notificationManager.error('Ha ocurrido un error inesperado');

        // Enviar a servicio de reporte de errores si está configurado
        this.reportError?.(event.reason);
    }

    /**
     * Manejar eventos del carrito
     */
    handleCartEvent(event) {
        const { type, detail } = event;

        switch (type) {
            case 'cart:item-added':
                console.log('Item added to cart:', detail.item);
                break;
            case 'cart:item-removed':
                console.log('Item removed from cart:', detail.item);
                break;
            case 'cart:purchase-completed':
                this.handlePurchaseCompleted(detail);
                break;
        }
    }

    /**
     * Manejar compra completada
     */
    handlePurchaseCompleted(detail) {
        const { orderData, method } = detail;

        // Enviar datos de analytics si está configurado
        this.trackPurchase?.(orderData, method);

        // Mostrar mensaje de agradecimiento
        this.notificationManager.success('¡Gracias por tu compra!', {
            title: 'Compra Exitosa',
            persistent: true
        });
    }

    /**
     * Manejar smooth scroll
     */
    handleSmoothScroll(e) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            const offset = 80; // Altura del header fijo
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            this.updateActiveSection(e.target.getAttribute('href').substring(1));
        }
    }

    /**
     * Manejar formulario de contacto
     */
    async handleContactForm(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (!this.validateContactForm(data)) {
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, 'Enviando...');

        try {
            await this.simulateFormSubmission(data);
            this.notificationManager.success('Mensaje enviado con éxito. Te contactaré pronto.');
            e.target.reset();
        } catch (error) {
            this.notificationManager.error('Error al enviar el mensaje. Inténtalo de nuevo.');
        } finally {
            this.resetButton(submitBtn, 'Enviar Mensaje');
        }
    }

    /**
     * Manejar formulario de newsletter
     */
    async handleNewsletterForm(e) {
        e.preventDefault();

        const email = e.target.querySelector('input[type="email"]').value;

        if (!Helpers.validateEmail(email)) {
            this.notificationManager.error('Por favor, ingresa un email válido.');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, 'Suscribiendo...');

        try {
            await this.simulateNewsletterSubscription(email);
            this.notificationManager.success('¡Gracias por suscribirte!');
            e.target.reset();
        } catch (error) {
            this.notificationManager.error('Error al suscribirte. Inténtalo de nuevo.');
        } finally {
            this.resetButton(submitBtn, 'Suscribirse');
        }
    }

    /**
     * Validar formulario de contacto
     */
    validateContactForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            this.notificationManager.error('Por favor, ingresa tu nombre completo.');
            return false;
        }

        if (!Helpers.validateEmail(data.email)) {
            this.notificationManager.error('Por favor, ingresa un email válido.');
            return false;
        }

        if (!data.message || data.message.trim().length < 10) {
            this.notificationManager.error('Por favor, ingresa un mensaje con al menos 10 caracteres.');
            return false;
        }

        return true;
    }

    /**
     * Simular envío de formulario
     */
    simulateFormSubmission(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Contact form data:', data);
                resolve({ success: true });
            }, 2000);
        });
    }

    /**
     * Simular suscripción a newsletter
     */
    simulateNewsletterSubscription(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Newsletter subscription:', email);
                resolve({ success: true });
            }, 1500);
        });
    }

    /**
     * Configurar estado de loading en botones
     */
    setButtonLoading(button, text) {
        button.disabled = true;
        button.textContent = text;
        button.classList.add('loading');
    }

    /**
     * Resetear botón a estado normal
     */
    resetButton(button, text) {
        button.disabled = false;
        button.textContent = text;
        button.classList.remove('loading');
    }

    /**
     * Actualizar sección activa en navegación
     */
    updateActiveSection(sectionId) {
        if (this.currentSection === sectionId) return;

        this.currentSection = sectionId;

        document.querySelectorAll('.nav__link').forEach(link => {
            link.classList.remove('nav__link--active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('nav__link--active');
            }
        });
    }

    /**
     * Actualizar estado activo durante scroll
     */
    updateNavigationActiveState() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.updateActiveSection(sectionId);
            }
        });
    }

    /**
     * Manejar scroll del header
     */
    handleHeaderScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }

    /**
     * Actualizar progreso de scroll
     */
    updateScrollProgress() {
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            scrollProgress.style.width = scrolled + '%';
        }
    }

    /**
     * Manejar errores críticos
     */
    handleCriticalError(error) {
        // Mostrar mensaje de error crítico
        const errorElement = Helpers.createElement('div', ['critical-error']);
        errorElement.innerHTML = `
            <h2>Ha ocurrido un error crítico</h2>
            <p>La aplicación no pudo inicializarse correctamente.</p>
            <button onclick="location.reload()">Recargar página</button>
        `;

        document.body.appendChild(errorElement);
    }

    /**
     * Disparar evento personalizado de la app
     */
    dispatchAppEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                app: this,
                modules: Object.fromEntries(this.modules),
                ...detail
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Obtener un módulo
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Registrar un módulo
     */
    registerModule(name, module) {
        this.modules.set(name, module);
        this.dispatchAppEvent('app:module-registered', { name, module });
    }

    /**
     * Observar elementos animables
     */
    observeAnimatedElements(observer) {
        const elements = document.querySelectorAll('.service-card, .product-card, .agent-card, .tutorial-card');
        elements.forEach(el => observer.observe(el));
    }

    /**
     * Observar elementos con lazy loading
     */
    observeLazyElements(observer) {
        const elements = document.querySelectorAll('img[data-src], [data-lazy]');
        elements.forEach(el => observer.observe(el));
    }

    /**
     * Cargar elemento lazy
     */
    loadLazyElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.classList.remove('lazy-image');
        }
    }

    /**
     * Configurar efectos parallax
     */
    setupParallaxEffects() {
        const heroImage = document.querySelector('.hero__profile-image');
        if (heroImage) {
            window.addEventListener('scroll', Helpers.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroImage.style.transform = `translateY(${rate}px)`;
            }, 16));
        }
    }

    /**
     * Configurar microinteracciones
     */
    setupMicroInteractions() {
        // Hover effects
        document.querySelectorAll('.hover-lift').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-5px)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }

    /**
     * Cerrar todos los modales
     */
    closeAllModals() {
        // Cerrar carrito
        if (this.cartManager && this.cartManager.isOpen) {
            this.cartManager.closeCart();
        }

        // Cerrar otros modales
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Log métricas de performance
     */
    logPerformanceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const metrics = {
                domContentLoaded: Math.max(0, navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                loadComplete: Math.max(0, navigation.loadEventEnd - navigation.fetchStart),
                domInteractive: Math.max(0, navigation.domInteractive - navigation.fetchStart),
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            };

            console.log('📊 Performance Metrics:', {
                'DOM Content Loaded': `${metrics.domContentLoaded.toFixed(2)}ms`,
                'Load Complete': `${metrics.loadComplete.toFixed(2)}ms`,
                'DOM Interactive': `${metrics.domInteractive.toFixed(2)}ms`,
                'First Paint': `${metrics.firstPaint.toFixed(2)}ms`,
                'First Contentful Paint': `${metrics.firstContentfulPaint.toFixed(2)}ms`
            });
        }
    }

    /**
     * Monitorizar uso de memoria
     */
    monitorMemoryUsage() {
        setInterval(() => {
            const memory = performance.memory;
            if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                console.warn('High memory usage detected:', {
                    used: memory.usedJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                });
            }
        }, 30000); // Revisar cada 30 segundos
    }

    /**
     * Observar elementos redimensionables
     */
    observeResizableElements(observer) {
        if (!observer) return;

        // Observar elementos que necesitan responsive
        const elements = document.querySelectorAll('.hero__content, .service-card, .product-card, .agent-card, .tutorial-card, .contact-form');
        elements.forEach(el => observer.observe(el));
    }

    /**
     * Manejar cambios de responsive
     */
    handleResponsiveChanges() {
        // Actualizar layouts responsivos
        this.updateMobileMenu();
        this.updateHeroLayout();
        this.updateCardLayouts();
        this.updateNavigationLayout();
    }

    /**
     * Configurar menú móvil
     */
    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        // Depuración: Verificar si los elementos existen
        console.log('🔍 Setup Mobile Menu Debug:');
        console.log('navToggle found:', !!navToggle, navToggle);
        console.log('navMenu found:', !!navMenu, navMenu);
        console.log('Document ready state:', document.readyState);
        console.log('Window width:', window.innerWidth);
        console.log('Is mobile (userAgent):', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        if (!navToggle || !navMenu) {
            console.error('❌ Nav toggle or menu not found');
            console.error('navToggle:', navToggle);
            console.error('navMenu:', navMenu);
            console.error('All elements with nav-toggle:', document.querySelectorAll('[id="nav-toggle"]'));
            console.error('All elements with nav-menu:', document.querySelectorAll('[id="nav-menu"]'));
            console.error('All nav elements:', document.querySelectorAll('.nav__toggle'));
            console.error('All menu elements:', document.querySelectorAll('.nav__menu'));
            return;
        }

        // Event listener para el botón de menú
        navToggle.addEventListener('click', (e) => {
            console.log('📱 Click en nav-toggle detectado');
            console.log('Evento:', e);
            console.log('Target:', e.target);
            console.log('Current target es nav-toggle?:', e.target === navToggle);
            e.preventDefault();
            this.toggleMobileMenu();
        });

        // Event listener para touch (para dispositivos móviles)
        navToggle.addEventListener('touchstart', (e) => {
            console.log('📱 Touch en nav-toggle detectado');
            console.log('Evento:', e);
            console.log('Target:', e.target);
            e.preventDefault();
            this.toggleMobileMenu();
        }, { passive: false });

        // Soporte para teclado (Enter y Space)
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        });

        // Cerrar menú al hacer clic en un enlace
        navMenu.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Cerrar menú con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('nav__menu--active')) {
                this.closeMobileMenu();
            }
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('nav__menu--active') &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle del menú móvil
     */
    toggleMobileMenu() {
        console.log('🔄 toggleMobileMenu llamado');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) {
            console.error('❌ toggleMobileMenu: Elementos no encontrados');
            return;
        }

        const isOpen = navMenu.classList.contains('nav__menu--active');
        console.log('📱 Estado actual del menú:', isOpen);

        if (isOpen) {
            console.log('📱 Cerrando menú...');
            this.closeMobileMenu();
        } else {
            console.log('📱 Abriendo menú...');
            this.openMobileMenu();
        }
    }

    /**
     * Abrir menú móvil
     */
    openMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) return;

        navMenu.classList.add('nav__menu--active');
        navToggle.classList.add('nav__toggle--active');

        // Actualizar atributos ARIA
        navToggle.setAttribute('aria-expanded', 'true');

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';

        // Focus trap dentro del menú
        const firstLink = navMenu.querySelector('.nav__link');
        if (firstLink) {
            firstLink.focus();
        }
    }

    /**
     * Cerrar menú móvil
     */
    closeMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) return;

        navMenu.classList.remove('nav__menu--active');
        navToggle.classList.remove('nav__toggle--active');

        // Actualizar atributos ARIA
        navToggle.setAttribute('aria-expanded', 'false');

        // Restaurar scroll del body
        document.body.style.overflow = '';

        // Devolver focus al botón toggle
        navToggle.focus();
    }

    /**
     * Actualizar menú móvil
     */
    updateMobileMenu() {
        const isMobile = Helpers.getDeviceInfo().isMobile;
        const nav = document.querySelector('.nav');
        const menuToggle = document.querySelector('.menu-toggle');

        if (isMobile && nav) {
            nav.classList.add('nav--mobile');
        } else if (nav) {
            nav.classList.remove('nav--mobile');
        }
    }

    /**
     * Actualizar layout del hero
     */
    updateHeroLayout() {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero__content');
        const isMobile = Helpers.getDeviceInfo().isMobile;

        if (hero && heroContent) {
            if (isMobile) {
                hero.classList.add('hero--mobile');
                heroContent.classList.add('hero__content--mobile');
            } else {
                hero.classList.remove('hero--mobile');
                heroContent.classList.remove('hero__content--mobile');
            }
        }
    }

    /**
     * Actualizar layouts de cards
     */
    updateCardLayouts() {
        const isMobile = Helpers.getDeviceInfo().isMobile;
        const cards = document.querySelectorAll('.service-card, .product-card, .agent-card, .tutorial-card');

        cards.forEach(card => {
            if (isMobile) {
                card.classList.add('card--mobile');
            } else {
                card.classList.remove('card--mobile');
            }
        });
    }

    /**
     * Actualizar layout de navegación
     */
    updateNavigationLayout() {
        const isMobile = Helpers.getDeviceInfo().isMobile;
        const header = document.querySelector('.header');

        if (header) {
            if (isMobile) {
                header.classList.add('header--mobile');
            } else {
                header.classList.remove('header--mobile');
            }
        }
    }

    /**
     * Manejar redimensionamiento de elementos
     */
    handleElementResize(element, contentRect) {
        // Disparar evento de redimensionamiento
        element.dispatchEvent(new CustomEvent('element:resize', {
            detail: { element, contentRect }
        }));

        // Actualizar clases responsivas si es necesario
        if (contentRect.width < 768) {
            element.classList.add('element--mobile');
        } else {
            element.classList.remove('element--mobile');
        }
    }

    /**
     * Manejar cambios en el DOM
     */
    handleDOMMutation(mutation) {
        if (mutation.type === 'childList') {
            // Re-observar nuevos elementos
            const resizeObserver = this.observers.get('resize');
            if (resizeObserver) {
                this.observeResizableElements(resizeObserver);
            }

            const animationObserver = this.observers.get('animation');
            if (animationObserver) {
                this.observeAnimatedElements(animationObserver);
            }

            const lazyLoadObserver = this.observers.get('lazyLoad');
            if (lazyLoadObserver) {
                this.observeLazyElements(lazyLoadObserver);
            }
        }
    }

    /**
     * Manejar navegación con tab
     */
    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Configurar skip links
     */
    setupSkipLinks() {
        const skipLinks = document.querySelectorAll('.sr-only[href^="#"]');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        });
    }

    /**
     * Configurar manejo de focus
     */
    setupFocusManagement() {
        // Manejar focus traps en modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    /**
     * Atrapar focus en modal
     */
    trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Configurar ARIA labels dinámicos
     */
    setupARIALabels() {
        // Actualizar ARIA labels basados en el estado
        const updateARIA = () => {
            // Navigation
            const nav = document.querySelector('.nav');
            if (nav) {
                const isMobile = Helpers.getDeviceInfo().isMobile;
                nav.setAttribute('aria-label', isMobile ? 'Menú de navegación móvil' : 'Menú de navegación principal');
            }

            // Cart
            const cartButton = document.querySelector('.cart-button');
            if (cartButton) {
                const itemCount = this.cartManager?.getItemCount() || 0;
                cartButton.setAttribute('aria-label', `Carrito de compras (${itemCount} artículos)`);
            }
        };

        // Actualizar inicialmente y en cambios
        updateARIA();
        document.addEventListener('cart:updated', updateARIA);
        window.addEventListener('resize', Helpers.debounce(updateARIA, 250));
    }

    /**
     * Configurar movimiento reducido
     */
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');

            // Deshabilitar animaciones CSS
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Pausar medios
     */
    pauseMedia() {
        const videos = document.querySelectorAll('video');
        const audios = document.querySelectorAll('audio');

        videos.forEach(video => {
            if (!video.paused) {
                video.dataset.wasPlaying = 'true';
                video.pause();
            }
        });

        audios.forEach(audio => {
            if (!audio.paused) {
                audio.dataset.wasPlaying = 'true';
                audio.pause();
            }
        });
    }

    /**
     * Reanudar medios
     */
    resumeMedia() {
        const videos = document.querySelectorAll('video[data-was-playing="true"]');
        const audios = document.querySelectorAll('audio[data-was-playing="true"]');

        videos.forEach(video => {
            delete video.dataset.wasPlaying;
            video.play().catch(() => {
                // Silenciar error si el navegador bloquea autoplay
            });
        });

        audios.forEach(audio => {
            delete audio.dataset.wasPlaying;
            audio.play().catch(() => {
                // Silenciar error si el navegador bloquea autoplay
            });
        });
    }

    /**
     * Sincronizar datos offline
     */
    syncOfflineData() {
        // Sincronizar carrito
        if (this.cartManager) {
            this.cartManager.syncOfflineData();
        }

        // Sincronizar otros datos offline
        console.log('🔄 Sincronizando datos offline...');
    }

    /**
     * Actualizar meta viewport
     */
    updateViewportMeta() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            const isMobile = Helpers.getDeviceInfo().isMobile;
            if (isMobile) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            } else {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        }
    }

    /**
     * Limpiar recursos
     */
    cleanup() {
        // Limpiar observers
        this.observers.forEach(observer => {
            observer?.disconnect();
        });

        // Limpiar event listeners
        // (Los listeners se limpian automáticamente al remover los elementos)

        // Limpiar módulos
        this.modules.forEach(module => {
            if (module.cleanup) {
                module.cleanup();
            }
        });

        console.log('🧹 App cleanup completed');
    }
}

// Crear instancia global de la aplicación
let appInstance;

/**
 * Inicializar aplicación
 */
export async function initializeApp() {
    if (appInstance) {
        return appInstance;
    }

    appInstance = new AlexDesignApp();
    window.alexApp = appInstance; // Para compatibilidad global

    return appInstance;
}

/**
 * Obtener instancia de la aplicación
 */
export function getApp() {
    if (!appInstance) {
        throw new Error('App not initialized. Call initializeApp() first.');
    }
    return appInstance;
}

// Auto-inicialización si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Cleanup al descargar la página
window.addEventListener('beforeunload', () => {
    if (appInstance) {
        appInstance.cleanup();
    }
});

export default AlexDesignApp;
