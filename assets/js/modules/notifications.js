/**
 * ===================================
   NOTIFICATIONS - ALEX DESIGN FILMS
   ===================================
 * Sistema de notificaciones modular
 */

import { Helpers } from '../utils/helpers.js';

/**
 * Clase para manejar notificaciones
 */
export class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.container = null;
        this.init();
    }

    /**
     * Inicializar el sistema de notificaciones
     */
    init() {
        this.createContainer();
        this.addStyles();
        console.log('🔔 Notification Manager initialized');
    }

    /**
     * Crear contenedor de notificaciones
     */
    createContainer() {
        this.container = Helpers.createElement('div', ['notifications-container']);
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notificaciones');
        document.body.appendChild(this.container);
    }

    /**
     * Agregar estilos CSS
     */
    addStyles() {
        const styles = `
            <style>
                .notifications-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    pointer-events: none;
                }
                
                .notification {
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 16px 20px;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    min-width: 300px;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: auto;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                
                .notification--show {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .notification--hide {
                    opacity: 0;
                    transform: translateX(100%);
                }
                
                .notification--success {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    border-left: 4px solid #16a34a;
                }
                
                .notification--error {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    border-left: 4px solid #dc2626;
                }
                
                .notification--info {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    border-left: 4px solid #2563eb;
                }
                
                .notification--warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    border-left: 4px solid #d97706;
                }
                
                .notification__content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .notification__icon {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    margin-top: 2px;
                }
                
                .notification__text {
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.4;
                    font-weight: 500;
                }
                
                .notification__title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .notification__close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 20px;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .notification__close:hover {
                    opacity: 1;
                }
                
                .notification__progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.3);
                    transition: width linear;
                }
                
                @media (max-width: 640px) {
                    .notifications-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                    }
                    
                    .notification {
                        min-width: auto;
                        max-width: none;
                    }
                }
                
                .notification--slide-in {
                    animation: notificationSlideIn 0.3s ease-out;
                }
                
                .notification--slide-out {
                    animation: notificationSlideOut 0.3s ease-in;
                }
                
                @keyframes notificationSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes notificationSlideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * Mostrar notificación
     */
    show(message, options = {}) {
        const config = {
            type: 'info',
            duration: this.defaultDuration,
            title: '',
            persistent: false,
            icon: true,
            progress: true,
            ...options
        };

        // Limitar número de notificaciones
        if (this.notifications.length >= this.maxNotifications) {
            this.remove(this.notifications[0].id);
        }

        const notification = this.createNotification(message, config);
        this.container.appendChild(notification);
        
        // Añadir a la lista de notificaciones activas
        const notificationData = {
            id: notification.dataset.id,
            element: notification,
            config
        };
        this.notifications.push(notificationData);

        // Mostrar con animación
        requestAnimationFrame(() => {
            notification.classList.add('notification--show');
        });

        // Configurar auto-remoción
        if (!config.persistent) {
            this.setupAutoRemove(notificationData);
        }

        // Configurar barra de progreso
        if (config.progress && !config.persistent) {
            this.setupProgressBar(notificationData);
        }

        return notificationData.id;
    }

    /**
     * Crear elemento de notificación
     */
    createNotification(message, config) {
        const notification = Helpers.createElement('div', ['notification']);
        const id = Helpers.generateId('notification');
        notification.dataset.id = id;

        // Determinar icono según tipo
        let iconSvg = '';
        if (config.icon) {
            switch (config.type) {
                case 'success':
                    iconSvg = '<svg class="notification__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
                    break;
                case 'error':
                    iconSvg = '<svg class="notification__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
                    break;
                case 'warning':
                    iconSvg = '<svg class="notification__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
                    break;
                default:
                    iconSvg = '<svg class="notification__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
            }
        }

        let contentHtml = `
            <div class="notification__content">
                ${iconSvg}
                <div class="notification__text">
                    ${config.title ? `<div class="notification__title">${Helpers.escapeHtml(config.title)}</div>` : ''}
                    ${Helpers.escapeHtml(message)}
                </div>
            </div>
            <button class="notification__close" aria-label="Cerrar notificación">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        `;

        if (config.progress && !config.persistent) {
            contentHtml += '<div class="notification__progress"></div>';
        }

        notification.innerHTML = contentHtml;
        notification.classList.add(`notification--${config.type}`);

        // Event listeners
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => {
            this.remove(id);
        });

        notification.addEventListener('click', () => {
            this.remove(id);
        });

        return notification;
    }

    /**
     * Configurar auto-remoción
     */
    setupAutoRemove(notificationData) {
        notificationData.timeoutId = setTimeout(() => {
            this.remove(notificationData.id);
        }, notificationData.config.duration);
    }

    /**
     * Configurar barra de progreso
     */
    setupProgressBar(notificationData) {
        const progressBar = notificationData.element.querySelector('.notification__progress');
        if (!progressBar) return;

        const duration = notificationData.config.duration;
        const startTime = Date.now();

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.max(0, 100 - (elapsed / duration) * 100);
            
            progressBar.style.width = `${progress}%`;

            if (progress > 0 && notificationData.timeoutId) {
                requestAnimationFrame(updateProgress);
            }
        };

        requestAnimationFrame(updateProgress);
    }

    /**
     * Remover notificación
     */
    remove(id) {
        const notificationIndex = this.notifications.findIndex(n => n.id === id);
        if (notificationIndex === -1) return;

        const notificationData = this.notifications[notificationIndex];
        
        // Limpiar timeout
        if (notificationData.timeoutId) {
            clearTimeout(notificationData.timeoutId);
        }

        // Animar salida
        notificationData.element.classList.add('notification--hide');
        
        setTimeout(() => {
            if (notificationData.element.parentNode) {
                notificationData.element.parentNode.removeChild(notificationData.element);
            }
        }, 300);

        // Remover de la lista
        this.notifications.splice(notificationIndex, 1);
    }

    /**
     * Limpiar todas las notificaciones
     */
    clear() {
        [...this.notifications].forEach(notificationData => {
            this.remove(notificationData.id);
        });
    }

    /**
     * Mostrar notificación de éxito
     */
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    /**
     * Mostrar notificación de error
     */
    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error', duration: 7000 });
    }

    /**
     * Mostrar notificación de información
     */
    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    /**
     * Mostrar notificación de advertencia
     */
    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    /**
     * Mostrar notificación persistente
     */
    persistent(message, options = {}) {
        return this.show(message, { ...options, persistent: true });
    }

    /**
     * Obtener número de notificaciones activas
     */
    getCount() {
        return this.notifications.length;
    }

    /**
     * Verificar si hay notificaciones activas
     */
    hasActive() {
        return this.notifications.length > 0;
    }
}

// Crear instancia global
let notificationManager;

/**
 * Inicializar el gestor de notificaciones
 */
export function initializeNotifications() {
    if (!notificationManager) {
        notificationManager = new NotificationManager();
        window.notificationManager = notificationManager; // Para compatibilidad
    }
    return notificationManager;
}

/**
 * Obtener instancia del gestor de notificaciones
 */
export function getNotificationManager() {
    if (!notificationManager) {
        return initializeNotifications();
    }
    return notificationManager;
}

// Auto-inicialización si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotifications);
} else {
    initializeNotifications();
}

export default NotificationManager;
