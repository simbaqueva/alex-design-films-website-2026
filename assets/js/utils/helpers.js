/**
 * ===================================
   HELPERS - ALEX DESIGN FILMS
   ===================================
 * Utilidades reutilizables para toda la aplicación
 */

/**
 * Clase de utilidades generales
 */
export class Helpers {
    /**
     * Validar email
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Formatear precio
     */
    static formatPrice(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Debounce function
     */
    static debounce(func, wait) {
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
    static throttle(func, limit) {
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
    static generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Copiar al portapapeles
     */
    static async copyToClipboard(text) {
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
    static getDeviceInfo() {
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

    /**
     * Escapar HTML para prevenir XSS
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Crear elemento con clases
     */
    static createElement(tag, classes = [], content = '') {
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
     * Animar elemento con CSS
     */
    static animateElement(element, animationClass, duration = 600) {
        return new Promise(resolve => {
            element.classList.add(animationClass);
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve();
            }, duration);
        });
    }

    /**
     * Esperar un tiempo específico
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtener parámetros de URL
     */
    static getUrlParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }

    /**
     * Guardar en localStorage con manejo de errores
     */
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    }

    /**
     * Cargar desde localStorage con manejo de errores
     */
    static loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return defaultValue;
        }
    }

    /**
     * Eliminar de localStorage con manejo de errores
     */
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    }

    /**
     * Limpiar elementos viejos del localStorage
     */
    static cleanOldStorage(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 días por defecto
        try {
            const keys = Object.keys(localStorage);
            const now = Date.now();
            
            keys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.timestamp && (now - data.timestamp) > maxAge) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Ignorar errores en elementos que no son JSON
                }
            });
        } catch (error) {
            console.error('Error cleaning storage:', error);
        }
    }

    /**
     * Detectar si está en modo oscuro (si el navegador lo soporta)
     */
    static isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * Convertir bytes a formato legible
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Generar color aleatorio
     */
    static generateRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    /**
     * Calcular distancia entre dos puntos
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Convertir grados a radianes
     */
    static toRad(deg) {
        return deg * (Math.PI/180);
    }
}

/**
 * Clase para manejo de fechas
 */
export class DateHelper {
    /**
     * Formatear fecha relativa (hace 2 horas, ayer, etc.)
     */
    static getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) return `hace ${years} año${years > 1 ? 's' : ''}`;
        if (months > 0) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
        if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'hace unos segundos';
    }

    /**
     * Formatear fecha a formato local
     */
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return new Intl.DateTimeFormat('es-CO', { ...defaultOptions, ...options }).format(new Date(date));
    }

    /**
     * Obtener inicio del día
     */
    static getStartOfDay(date = new Date()) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    /**
     * Obtener fin del día
     */
    static getEndOfDay(date = new Date()) {
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return end;
    }
}

/**
 * Clase para manejo de arrays y objetos
 */
export class CollectionHelper {
    /**
     * Agrupar array por propiedad
     */
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    /**
     * Ordenar array por propiedad
     */
    static sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            if (direction === 'desc') {
                return b[key] > a[key] ? 1 : -1;
            }
            return a[key] > b[key] ? 1 : -1;
        });
    }

    /**
     * Filtrar array únicos por propiedad
     */
    static uniqueBy(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }

    /**
     * Paginar array
     */
    static paginate(array, page = 1, limit = 10) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            data: array.slice(startIndex, endIndex),
            total: array.length,
            page,
            limit,
            totalPages: Math.ceil(array.length / limit)
        };
    }
}

// Exportar instancias por defecto para compatibilidad
export default {
    Helpers,
    DateHelper,
    CollectionHelper
};
