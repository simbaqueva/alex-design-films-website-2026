/**
 * ===================================
   COMPONENTS LOADER - ALEX DESIGN FILMS
   ===================================
 * Utilidades para carga y gestión de componentes
 */

class ComponentsLoader {
    constructor() {
        this.components = {};
        this.loadedComponents = new Set();
        this.loadingPromises = new Map();
    }

    /**
     * Cargar un componente específico
     */
    async loadComponent(componentName, containerId) {
        if (this.loadedComponents.has(componentName)) {
            return Promise.resolve();
        }

        // Evitar cargas duplicadas
        if (this.loadingPromises.has(componentName)) {
            return this.loadingPromises.get(componentName);
        }

        const loadPromise = this.fetchComponent(componentName);
        this.loadingPromises.set(componentName, loadPromise);

        try {
            const html = await loadPromise;
            this.components[componentName] = html;
            this.loadedComponents.add(componentName);
            
            // Insertar en el DOM si se especifica container
            if (containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = html;
                }
            }

            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            throw error;
        } finally {
            this.loadingPromises.delete(componentName);
        }
    }

    /**
     * Obtener HTML de un componente
     */
    async fetchComponent(componentName) {
        const response = await fetch(`./assets/components/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
    }

    /**
     * Cargar múltiples componentes en paralelo
     */
    async loadMultipleComponents(components) {
        const promises = components.map(({ name, container }) => 
            this.loadComponent(name, container)
        );
        
        try {
            await Promise.all(promises);
            console.log('✅ All components loaded successfully');
        } catch (error) {
            console.error('❌ Error loading components:', error);
            throw error;
        }
    }

    /**
     * Obtener un componente cacheado
     */
    getComponent(componentName) {
        return this.components[componentName] || null;
    }

    /**
     * Verificar si un componente está cargado
     */
    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    /**
     * Precargar todos los componentes
     */
    async preloadAllComponents() {
        const componentList = [
            { name: 'header', container: 'header-container' },
            { name: 'hero-section', container: 'app-container' },
            { name: 'services-section', container: 'services-container' },
            { name: 'shop-section', container: 'shop-container' },
            { name: 'ai-agents-section', container: 'ai-agents-container' },
            { name: 'tutorials-section', container: 'tutorials-container' },
            { name: 'contact-section', container: 'contact-container' },
            { name: 'footer', container: 'footer-container' }
            // El carrito se carga dinámicamente solo en la página de tienda
        ];

        try {
            await this.loadMultipleComponents(componentList);
            console.log('✅ All components loaded successfully');
        } catch (error) {
            console.error('❌ Error loading components:', error);
            throw error;
        }
    }

    /**
     * Inicializar componentes después de cargar
     */
    initializeComponents() {
        // Inicializar tooltips si existen
        this.initializeTooltips();
        
        // Inicializar lazy loading de imágenes
        this.initializeLazyImages();
        
        // Inicializar animaciones de entrada
        this.initializeEntryAnimations();
        
        // Disparar evento de que los componentes están cargados
        document.dispatchEvent(new CustomEvent('components:loaded', {
            detail: {
                timestamp: Date.now(),
                components: Array.from(this.loadedComponents)
            }
        }));
        
        console.log('✅ Components initialized and event dispatched');
    }

    /**
     * Inicializar tooltips
     */
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = e.target.dataset.tooltip;
                
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                
                setTimeout(() => tooltip.classList.add('tooltip--visible'), 10);
            });

            element.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.classList.remove('tooltip--visible');
                    setTimeout(() => tooltip.remove(), 200);
                }
            });
        });
    }

    /**
     * Inicializar lazy loading de imágenes
     */
    initializeLazyImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('lazy-image');
            imageObserver.observe(img);
        });
    }

    /**
     * Inicializar animaciones de entrada
     */
    initializeEntryAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.dataset.animate;
                    element.classList.add(animation);
                    animationObserver.unobserve(element);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => {
            animationObserver.observe(element);
        });
    }
}

/**
 * Utilidades adicionales para componentes
 */
class ComponentUtils {
    /**
     * Crear elemento con clases
     */
    createElement(tag, classes = [], content = '') {
        const element = document.createElement(tag);
        
        if (classes.length > 0) {
            element.className = classes.join(' ');
        }
        
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    }

    /**
     * Validar email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Formatear precio
     */
    formatPrice(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generar ID único
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Copiar al portapapeles
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    /**
     * Detectar dispositivo
     */
    getDeviceInfo() {
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
        const isDesktop = !isMobile && !isTablet;
        
        return {
            isMobile,
            isTablet,
            isDesktop,
            userAgent: ua
        };
    }
}

// Instancias globales
window.componentsLoader = new ComponentsLoader();
window.componentUtils = new ComponentUtils();

// Estilos para tooltips y lazy loading
const additionalStyles = `
<style>
.tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transform: translateY(5px);
    transition: all 0.2s ease-in-out;
    pointer-events: none;
    white-space: nowrap;
    max-width: 200px;
    word-wrap: break-word;
}

.tooltip--visible {
    opacity: 1;
    transform: translateY(0);
}

.lazy-image {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

.lazy-image.loaded {
    opacity: 1;
}

[data-animate] {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
}

[data-animate].animate-fade-in-up {
    opacity: 1;
    transform: translateY(0);
}

[data-animate].animate-fade-in {
    opacity: 1;
    transform: translateY(0);
}

[data-animate].animate-slide-in-left {
    opacity: 1;
    transform: translateX(0);
}

[data-animate].animate-slide-in-right {
    opacity: 1;
    transform: translateX(0);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentsLoader, ComponentUtils };
}
