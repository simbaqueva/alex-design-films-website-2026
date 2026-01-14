/**
 * ===================================
   CART MANAGER - ALEX DESIGN FILMS
   ===================================
 * Sistema de carrito de compras modular
 */

import { Helpers } from '../utils/helpers.js';

/**
 * Clase para manejar el carrito de compras
 */
export class CartManager {
    constructor() {
        this.cart = [];
        this.isOpen = false;
        this.storageKey = 'alex_design_cart';
        this.maxItemQuantity = 99;
        this.cartTimeout = 7 * 24 * 60 * 60 * 1000; // 7 días
        this.listenersConfigured = false;
        this.isProcessing = false;
        this.init();
    }

    /**
     * Inicializar el carrito
     */
    init() {
        this.loadCartFromStorage();
        this.setupEventListeners();
        this.updateCartUI();
        console.log('🛒 Cart Manager initialized');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Evitar configurar listeners múltiples veces
        if (this.listenersConfigured) {
            return;
        }
        this.listenersConfigured = true;

        // Toggle carrito
        const toggleBtn = document.getElementById('cart-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                // Si el clic es en el enlace del ícono, no hacer toggle del carrito
                if (e.target.closest('.cart-widget__icon-link')) {
                    return; // El enlace manejará la navegación
                }
                this.toggleCart();
            });
        }

        // Cerrar carrito
        const closeBtn = document.getElementById('cart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCart());
        }

        // Overlay para cerrar
        const overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeCart());
        }

        // Botones de agregar al carrito - usar event delegation con debounce
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                e.stopPropagation();
                // Prevenir múltiples clics rápidos
                if (e.target.disabled || this.isProcessing) return;
                this.addToCart(e.target);
            }
        });

        // Botones de cantidad del carrito - manejo simple de clic
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-item__quantity-btn--decrease') ||
                e.target.classList.contains('cart-item__quantity-btn--increase')) {
                e.preventDefault();
                e.stopPropagation();
                
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const productId = cartItem.dataset.itemId;
                const action = e.target.classList.contains('cart-item__quantity-btn--increase') ? 'increase' : 'decrease';
                const quantityValue = cartItem.querySelector('.cart-item__quantity-value');
                const input = document.getElementById(`quantity-${productId}`);
                
                if (quantityValue && input) {
                    this.executeQuantityAction(productId, action, input, quantityValue);
                }
            }
        });

        // Soporte para touch devices
        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('cart-item__quantity-btn--decrease') ||
                e.target.classList.contains('cart-item__quantity-btn--increase')) {
                e.preventDefault();
                e.stopPropagation();
                
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const productId = cartItem.dataset.itemId;
                const action = e.target.classList.contains('cart-item__quantity-btn--increase') ? 'increase' : 'decrease';
                const quantityValue = cartItem.querySelector('.cart-item__quantity-value');
                const input = document.getElementById(`quantity-${productId}`);
                
                if (quantityValue && input) {
                    this.executeQuantityAction(productId, action, input, quantityValue);
                }
            }
        });

        // Botones de cantidad en la tienda (shop-section)
        document.addEventListener('click', (e) => {
            // Verificar si el clic es en un botón de cantidad o su SVG interno
            const targetButton = e.target.closest('.quantity-selector__btn');
            if (targetButton && (
                targetButton.classList.contains('quantity-selector__decrease') ||
                targetButton.classList.contains('quantity-selector__increase')
            )) {
                e.preventDefault();
                e.stopPropagation();
                
                const productId = targetButton.dataset.productId;
                const action = targetButton.classList.contains('quantity-selector__increase') ? 'increase' : 'decrease';
                const input = document.getElementById(`quantity-${productId}`);
                
                if (input) {
                    this.updateShopQuantity(productId, action, input);
                }
            }
        });

        // Soporte para touch devices en la tienda
        document.addEventListener('touchend', (e) => {
            // Verificar si el toque es en un botón de cantidad o su SVG interno
            const targetButton = e.target.closest('.quantity-selector__btn');
            if (targetButton && (
                targetButton.classList.contains('quantity-selector__decrease') ||
                targetButton.classList.contains('quantity-selector__increase')
            )) {
                e.preventDefault();
                e.stopPropagation();
                
                const productId = targetButton.dataset.productId;
                const action = targetButton.classList.contains('quantity-selector__increase') ? 'increase' : 'decrease';
                const input = document.getElementById(`quantity-${productId}`);
                
                if (input) {
                    this.updateShopQuantity(productId, action, input);
                }
            }
        });

        // Soporte para input directo de cantidad (solo para inputs que no son readonly)
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-selector__input') && !e.target.readOnly) {
                e.preventDefault();
                e.stopPropagation();
                this.handleQuantityInput(e.target);
            }
        });

        // Soporte para teclado en inputs de cantidad (solo para inputs que no son readonly)
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('quantity-selector__input') && !e.target.readOnly) {
                this.handleQuantityKeyboard(e.target, e);
            }
        });

        // Botón de vaciar carrito
        const clearBtn = document.getElementById('cart-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCart());
        }

        // Botón de checkout
        const checkoutBtn = document.getElementById('cart-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }

    /**
     * Ejecutar acción de cantidad - clic simple
     */
    executeQuantityAction(productId, action, input, quantityDisplay) {
        const currentValue = parseInt(input.value) || 1;
        let newValue = currentValue;

        if (action === 'increase') {
            newValue = Math.min(currentValue + 1, this.maxItemQuantity);
        } else if (action === 'decrease') {
            newValue = Math.max(currentValue - 1, 1);
        }

        if (newValue !== currentValue) {
            input.value = newValue;
            if (quantityDisplay) {
                quantityDisplay.textContent = newValue;
            }
            this.updateProductQuantity(productId, newValue);

            // Animar cambio
            if (quantityDisplay) {
                quantityDisplay.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    quantityDisplay.style.transform = 'scale(1)';
                }, 150);
            }
        }
    }

    /**
     * Manejar input directo de cantidad
     */
    handleQuantityInput(input) {
        const productId = input.dataset.productId;
        let value = parseInt(input.value) || 1;
        
        // Validar y limitar valores
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > this.maxItemQuantity) {
            value = this.maxItemQuantity;
        }

        input.value = value;

        // Actualizar carrito si hay cambios
        this.updateProductQuantity(productId, value);

        // Animar cambio
        input.style.transform = 'scale(1.05)';
        setTimeout(() => {
            input.style.transform = 'scale(1)';
        }, 100);
    }

    /**
     * Manejar teclado en inputs de cantidad
     */
    handleQuantityKeyboard(input, event) {
        const productId = input.dataset.productId;
        let value = parseInt(input.value) || 1;

        if (event.key === 'ArrowUp' || event.key === '+') {
            event.preventDefault();
            value = Math.min(value + 1, this.maxItemQuantity);
            input.value = value;
            this.updateProductQuantity(productId, value);
        } else if (event.key === 'ArrowDown' || event.key === '-') {
            event.preventDefault();
            value = Math.max(value - 1, 1);
            input.value = value;
            this.updateProductQuantity(productId, value);
        } else if (event.key >= '0' && event.key <= '9') {
            // Permitir entrada directa de números
            setTimeout(() => {
                const newValue = parseInt(input.value) || 1;
                const validValue = Math.min(Math.max(newValue, 1), this.maxItemQuantity);
                if (validValue !== newValue) {
                    input.value = validValue;
                    this.updateProductQuantity(productId, validValue);
                }
            }, 10);
        }
    }

    /**
     * Actualizar cantidad de producto específico
     */
    updateProductQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            this.updateQuantity(productId, quantity);
        }
    }

    /**
     * Actualizar cantidad en la tienda (shop-section)
     */
    updateShopQuantity(productId, action, input) {
        const currentValue = parseInt(input.value) || 1;
        let newValue = currentValue;

        if (action === 'increase') {
            newValue = Math.min(currentValue + 1, this.maxItemQuantity);
        } else if (action === 'decrease') {
            newValue = Math.max(currentValue - 1, 1);
        }

        if (newValue !== currentValue) {
            input.value = newValue;

            // Animar el input
            input.style.transform = 'scale(1.1)';
            input.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                input.style.transform = 'scale(1)';
                input.style.backgroundColor = '';
            }, 200);

            // Animar el botón presionado
            const button = document.querySelector(`.quantity-selector__btn[data-product-id="${productId}"].${action === 'increase' ? 'quantity-selector__increase' : 'quantity-selector__decrease'}`);
            if (button) {
                button.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 100);
            }
        }
    }

    /**
     * Abrir/cerrar carrito
     */
    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    /**
     * Abrir carrito
     */
    openCart() {
        const dropdown = document.getElementById('cart-dropdown');
        const overlay = document.getElementById('cart-overlay');
        
        if (dropdown && overlay) {
            dropdown.classList.add('cart-widget__dropdown--active');
            overlay.classList.add('cart-widget__overlay--active');
            this.isOpen = true;
            
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
            
            // Focus management para accesibilidad
            this.manageFocus('enter');
        }
    }

    /**
     * Cerrar carrito
     */
    closeCart() {
        const dropdown = document.getElementById('cart-dropdown');
        const overlay = document.getElementById('cart-overlay');
        
        if (dropdown && overlay) {
            dropdown.classList.remove('cart-widget__dropdown--active');
            overlay.classList.remove('cart-widget__overlay--active');
            this.isOpen = false;
            
            // Restaurar scroll del body
            document.body.style.overflow = '';
            
            // Focus management para accesibilidad
            this.manageFocus('exit');
        }
    }

    /**
     * Manejar focus para accesibilidad
     */
    manageFocus(action) {
        const toggleBtn = document.getElementById('cart-toggle');
        const firstFocusable = document.querySelector('#cart-close');
        const lastFocusable = document.querySelector('#cart-checkout');

        if (action === 'enter' && firstFocusable) {
            firstFocusable.focus();
        } else if (action === 'exit' && toggleBtn) {
            toggleBtn.focus();
        }

        // Trap focus dentro del carrito
        if (action === 'enter') {
            this.focusTrapHandler = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable?.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable?.focus();
                        }
                    }
                }
            };
            document.addEventListener('keydown', this.focusTrapHandler);
        } else {
            document.removeEventListener('keydown', this.focusTrapHandler);
        }
    }

    /**
     * Agregar producto al carrito
     */
    addToCart(button) {
        // Prevenir procesamiento múltiple simultáneo
        if (this.isProcessing) {
            return;
        }
        
        this.isProcessing = true;
        
        const productName = button.dataset.product;
        const price = parseFloat(button.dataset.price);
        const productId = button.dataset.productId || this.generateProductId();
        const quantityInput = document.getElementById(`quantity-${productId}`);
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        if (!productName || isNaN(price) || isNaN(quantity) || quantity < 1) {
            console.error('Product data missing or invalid');
            this.isProcessing = false;
            return;
        }

        // Verificar si el producto ya está en el carrito
        const existingItem = this.cart.find(item => 
            item.id === productId && item.name === productName
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity <= this.maxItemQuantity) {
                existingItem.quantity = newQuantity;
                this.showNotification(`${productName} cantidad actualizada (${newQuantity} unidades)`, 'info');
            } else {
                this.showNotification(`Máxima cantidad alcanzada para ${productName}`, 'warning');
                this.isProcessing = false;
                return;
            }
        } else {
            const newItem = {
                id: productId,
                name: productName,
                price: price,
                quantity: quantity,
                timestamp: Date.now(),
                addedAt: new Date().toISOString()
            };
            
            this.cart.push(newItem);
            this.showNotification(`${productName} (${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}) agregado al carrito`, 'success');
        }

        this.saveCartToStorage();
        this.updateCartUI();
        this.animateButton(button);

        // Resetear la cantidad a 1 después de agregar
        if (quantityInput) {
            quantityInput.value = 1;
        }

        // Disparar evento personalizado
        this.dispatchCartEvent('item-added', {
            item: existingItem || this.cart[this.cart.length - 1],
            cart: this.cart,
            quantityAdded: quantity
        });

        // Resetear flag de procesamiento después de un breve delay
        setTimeout(() => {
            this.isProcessing = false;
        }, 300);
    }

    /**
     * Generar ID único para producto
     */
    generateProductId() {
        return Helpers.generateId('product');
    }

    /**
     * Remover producto del carrito
     */
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.showNotification(`${removedItem.name} eliminado del carrito`, 'info');
            this.saveCartToStorage();
            this.updateCartUI();

            // Disparar evento personalizado
            this.dispatchCartEvent('item-removed', {
                item: removedItem,
                cart: this.cart
            });
        }
    }

    /**
     * Actualizar cantidad de producto
     */
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else if (newQuantity <= this.maxItemQuantity) {
                const oldQuantity = item.quantity;
                item.quantity = newQuantity;
                this.saveCartToStorage();
                this.updateCartUI();

                // Disparar evento personalizado
                this.dispatchCartEvent('quantity-updated', {
                    item,
                    oldQuantity,
                    newQuantity,
                    cart: this.cart
                });
            } else {
                this.showNotification(`Máxima cantidad es ${this.maxItemQuantity}`, 'warning');
            }
        }
    }

    /**
     * Vaciar carrito
     */
    clearCart() {
        if (this.cart.length === 0) {
            this.showNotification('El carrito ya está vacío', 'info');
            return;
        }

        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            const oldCart = [...this.cart];
            this.cart = [];
            this.saveCartToStorage();
            this.updateCartUI();
            this.showNotification('Carrito vaciado', 'success');

            // Disparar evento personalizado
            this.dispatchCartEvent('cart-cleared', {
                oldCart,
                cart: this.cart
            });
        }
    }

    /**
     * Calcular total del carrito
     */
    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Calcular subtotal (sin impuestos)
     */
    calculateSubtotal() {
        return this.calculateTotal();
    }

    /**
     * Calcular impuestos (simulado)
     */
    calculateTax(rate = 0.19) {
        return this.calculateSubtotal() * rate;
    }

    /**
     * Obtener resumen del carrito
     */
    getCartSummary() {
        const subtotal = this.calculateSubtotal();
        const tax = this.calculateTax();
        const total = subtotal + tax;
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        return {
            subtotal,
            tax,
            total,
            itemCount,
            itemCountFormatted: `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`
        };
    }

    /**
     * Actualizar interfaz del carrito
     */
    updateCartUI() {
        this.updateCartBadge();
        this.updateCartItems();
        this.updateCartSummary();
    }

    /**
     * Actualizar badge del carrito
     */
    updateCartBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
            
            // Añadir animación cuando cambia el número
            badge.classList.add('cart-widget__badge--pulse');
            setTimeout(() => {
                badge.classList.remove('cart-widget__badge--pulse');
            }, 300);
        }
    }

    /**
     * Actualizar lista de items en el carrito
     */
    updateCartItems() {
        const container = document.getElementById('cart-items');
        const emptyMessage = document.getElementById('cart-empty');
        
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cart-widget__empty" id="cart-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.5; margin-bottom: 12px;">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
            return;
        }

        const itemsHTML = this.cart.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item__info">
                    <h4 class="cart-item__name">${Helpers.escapeHtml(item.name)}</h4>
                    <p class="cart-item__price">$${item.price.toFixed(2)}</p>
                    <p class="cart-item__subtotal">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="cart-item__controls">
                    <div class="cart-item__quantity">
                        <button class="cart-item__quantity-btn cart-item__quantity-btn--decrease" 
                                data-action="decrease"
                                aria-label="Disminuir cantidad">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13H5v-2h14v2z"/>
                            </svg>
                        </button>
                        <span class="cart-item__quantity-value">${item.quantity}</span>
                        <button class="cart-item__quantity-btn cart-item__quantity-btn--increase" 
                                data-action="increase"
                                aria-label="Aumentar cantidad">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                        </button>
                    </div>
                    <button class="cart-item__remove" 
                            onclick="window.cartManager.removeFromCart('${item.id}')"
                            aria-label="Eliminar producto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;

        // Crear inputs ocultos para cada producto
        this.cart.forEach(item => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.className = 'quantity-selector__input';
            input.id = `quantity-${item.id}`;
            input.dataset.productId = item.id;
            input.value = item.quantity;
            container.appendChild(input);
        });
    }

    /**
     * Actualizar resumen del carrito
     */
    updateCartSummary() {
        const summary = document.getElementById('cart-summary');
        const footer = document.getElementById('cart-footer');
        const totalElement = document.getElementById('cart-total');

        if (!summary || !footer || !totalElement) return;

        if (this.cart.length > 0) {
            const summaryData = this.getCartSummary();
            totalElement.textContent = `$${summaryData.total.toFixed(2)}`;
            summary.style.display = 'block';
            footer.style.display = 'flex';
        } else {
            summary.style.display = 'none';
            footer.style.display = 'none';
        }
    }

    /**
     * Proceder al checkout
     */
    async proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('El carrito está vacío', 'error');
            return;
        }

        const summary = this.getCartSummary();
        const orderData = {
            items: this.cart,
            ...summary,
            timestamp: Date.now(),
            orderId: Helpers.generateId('order')
        };

        try {
            this.showNotification('Procesando pedido...', 'info', { persistent: true });
            await this.processCheckout(orderData);
        } catch (error) {
            this.showNotification('Error al procesar el pedido', 'error');
            console.error('Checkout error:', error);
        }
    }

    /**
     * Procesar checkout
     */
    async processCheckout(orderData) {
        // Simular procesamiento
        await Helpers.wait(2000);
        
        // Aquí iría la integración con pasarelas de pago reales
        this.showPaymentOptions(orderData);
    }

    /**
     * Mostrar opciones de pago
     */
    showPaymentOptions(orderData) {
        const paymentMethods = [
            { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal' },
            { id: 'stripe', name: 'Stripe', icon: 'fab fa-stripe' },
            { id: 'mercadopago', name: 'Mercado Pago', icon: 'fab fa-mercadopago' },
            { id: 'wompi', name: 'Wompi', icon: 'fas fa-credit-card' }
        ];

        const paymentOptionsHTML = `
            <div class="payment-options">
                <h3>Selecciona tu método de pago</h3>
                <p class="payment-options__amount">Total: $${orderData.total.toFixed(2)}</p>
                <div class="payment-methods">
                    ${paymentMethods.map(method => `
                        <button class="payment-method" data-method="${method.id}">
                            <i class="${method.icon}"></i>
                            <span>${method.name}</span>
                        </button>
                    `).join('')}
                </div>
                <button class="payment-cancel" onclick="window.cartManager.closePaymentModal()">Cancelar</button>
            </div>
        `;

        this.createPaymentModal(paymentOptionsHTML, orderData);
    }

    /**
     * Crear modal de pago
     */
    createPaymentModal(content, orderData) {
        const modal = Helpers.createElement('div', ['payment-modal']);
        modal.innerHTML = `
            <div class="payment-modal__overlay"></div>
            <div class="payment-modal__content">
                ${content}
            </div>
        `;

        document.body.appendChild(modal);
        window.currentPaymentModal = modal;

        // Configurar handlers
        this.setupPaymentHandlers(orderData);
    }

    /**
     * Configurar handlers de métodos de pago
     */
    setupPaymentHandlers(orderData) {
        const modal = window.currentPaymentModal;
        if (!modal) return;

        const paymentButtons = modal.querySelectorAll('.payment-method');
        paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const method = button.dataset.method;
                this.processPayment(method, orderData);
            });
        });

        // Cerrar modal con overlay
        const overlay = modal.querySelector('.payment-modal__overlay');
        overlay.addEventListener('click', () => {
            this.closePaymentModal();
        });
    }

    /**
     * Procesar pago con método seleccionado
     */
    async processPayment(method, orderData) {
        this.showNotification(`Redirigiendo a pasarela de pagos...`, 'info');

        try {
            // Simular procesamiento de pago
            await Helpers.wait(2000);
            
            // Redirigir a ventana en blanco temporalmente
            this.closePaymentModal();
            
            // Crear ventana de pago temporal
            const paymentWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            // Esperar un poco y luego redirigir
            setTimeout(() => {
                paymentWindow.location.href = 'https://example.com/payment'; // Cambiar esto por la pasarela real
            }, 1000);
            
            this.clearCart();
            this.showNotification('Redirigiendo a pasarela de pagos...', 'info', {
                title: 'Procesando Pago',
                persistent: true
            });

            // Disparar evento de compra completada
            this.dispatchCartEvent('purchase-completed', {
                method,
                orderData,
                timestamp: Date.now()
            });

        } catch (error) {
            this.showNotification(`Error al procesar pago con ${method}`, 'error');
            console.error('Payment error:', error);
        }
    }

    /**
     * Cerrar modal de pago
     */
    closePaymentModal() {
        if (window.currentPaymentModal) {
            window.currentPaymentModal.remove();
            window.currentPaymentModal = null;
        }
    }

    /**
     * Animar botón de agregar al carrito
     */
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        button.textContent = '✓ Agregado';
        button.disabled = true;
        
        setTimeout(() => {
            button.style.transform = '';
            button.textContent = 'Agregar al Carrito';
            button.disabled = false;
        }, 1000);
    }

    /**
     * Guardar carrito en localStorage
     */
    saveCartToStorage() {
        return Helpers.saveToStorage(this.storageKey, this.cart);
    }

    /**
     * Cargar carrito desde localStorage
     */
    loadCartFromStorage() {
        const savedCart = Helpers.loadFromStorage(this.storageKey, []);
        
        // Filtrar items viejos y validar estructura
        this.cart = savedCart
            .filter(item => item && item.id && item.name && typeof item.price === 'number')
            .filter(item => !item.timestamp || (Date.now() - item.timestamp) < this.cartTimeout);
        
        if (this.cart.length !== savedCart.length) {
            this.saveCartToStorage(); // Limpiar items viejos
        }
    }

    /**
     * Disparar evento personalizado del carrito
     */
    dispatchCartEvent(eventName, detail) {
        const event = new CustomEvent(`cart:${eventName}`, {
            detail: {
                cart: this.cart,
                summary: this.getCartSummary(),
                ...detail
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Mostrar notificación (usando el sistema global si está disponible)
     */
    showNotification(message, type = 'info', options = {}) {
        // Usar el sistema de notificaciones global si está disponible
        if (window.notificationManager) {
            return window.notificationManager[type](message, options);
        }

        // Fallback simple
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    /**
     * Obtener estadísticas del carrito
     */
    getCartStats() {
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const averagePrice = itemCount > 0 ? this.calculateTotal() / itemCount : 0;
        const mostExpensive = this.cart.reduce((max, item) => 
            item.price > (max?.price || 0) ? item : max, null);

        return {
            itemCount,
            uniqueItems: this.cart.length,
            averagePrice,
            mostExpensive,
            totalValue: this.calculateTotal()
        };
    }

    /**
     * Exportar carrito a JSON
     */
    exportCart() {
        const cartData = {
            cart: this.cart,
            summary: this.getCartSummary(),
            stats: this.getCartStats(),
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(cartData, null, 2);
    }

    /**
     * Importar carrito desde JSON
     */
    importCart(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.cart && Array.isArray(data.cart)) {
                this.cart = data.cart.filter(item => 
                    item && item.id && item.name && typeof item.price === 'number'
                );
                this.saveCartToStorage();
                this.updateCartUI();
                this.showNotification('Carrito importado correctamente', 'success');
                return true;
            }
        } catch (error) {
            this.showNotification('Error al importar carrito', 'error');
            console.error('Import error:', error);
        }
        return false;
    }
}

// Crear instancia global
let cartManager;

/**
 * Inicializar el gestor del carrito
 */
export function initializeCart() {
    if (!cartManager) {
        cartManager = new CartManager();
        window.cartManager = cartManager; // Para compatibilidad con HTML inline
    }
    return cartManager;
}

/**
 * Obtener instancia del gestor del carrito
 */
export function getCartManager() {
    if (!cartManager) {
        return initializeCart();
    }
    return cartManager;
}

// El carrito se inicializa dinámicamente desde el router
// Solo se inicializa automáticamente si se carga directamente

export default CartManager;