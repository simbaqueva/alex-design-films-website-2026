/**
 * ===================================
    WOMPI API CLIENT - Proxy Local
    ===================================
 * Cliente para hacer peticiones a la API de Wompi
 * a través del proxy local en server.py
 * 
 * Esto resuelve los problemas de:
 * - HTTPS requerido por Wompi
 * - CORS en localhost
 */

export class WompiAPIClient {
    constructor(config = {}) {
        // Configuración
        this.publicKey = config.publicKey || 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh';
        this.privateKey = config.privateKey || null; // Solo para backend
        this.proxyBaseUrl = config.proxyBaseUrl || '/api/wompi/';
        this.sandbox = config.sandbox !== false;

        console.log('🔌 Wompi API Client initialized (via proxy)', {
            sandbox: this.sandbox,
            proxyUrl: this.proxyBaseUrl
        });
    }

    /**
     * Hacer petición a la API de Wompi a través del proxy
     */
    async request(endpoint, options = {}) {
        try {
            const url = this.proxyBaseUrl + endpoint;

            const requestOptions = {
                method: options.method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            // Agregar Authorization si se proporciona
            if (options.usePrivateKey && this.privateKey) {
                requestOptions.headers['Authorization'] = `Bearer ${this.privateKey}`;
            } else if (options.usePublicKey) {
                requestOptions.headers['Authorization'] = `Bearer ${this.publicKey}`;
            }

            // Agregar body si existe
            if (options.body) {
                requestOptions.body = JSON.stringify(options.body);
            }

            console.log(`🔄 Wompi API Request: ${endpoint}`, requestOptions);

            const response = await fetch(url, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.reason || data.message || 'API request failed');
            }

            console.log(`✅ Wompi API Response: ${endpoint}`, data);
            return data;

        } catch (error) {
            console.error(`❌ Wompi API Error: ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * Crear token de tarjeta
     * Nota: Wompi recomienda usar su widget para esto por seguridad PCI
     */
    async createCardToken(cardData) {
        return this.request('tokens/cards', {
            method: 'POST',
            usePublicKey: true,
            body: {
                number: cardData.number,
                cvc: cardData.cvc,
                exp_month: cardData.expMonth,
                exp_year: cardData.expYear,
                card_holder: cardData.cardHolder
            }
        });
    }

    /**
     * Crear token de Nequi
     */
    async createNequiToken(phoneNumber) {
        return this.request('tokens/nequi', {
            method: 'POST',
            usePublicKey: true,
            body: {
                phone_number: phoneNumber
            }
        });
    }

    /**
     * Crear una transacción
     */
    async createTransaction(transactionData) {
        return this.request('transactions', {
            method: 'POST',
            usePrivateKey: true,
            body: {
                amount_in_cents: transactionData.amountInCents,
                currency: transactionData.currency || 'COP',
                customer_email: transactionData.customerEmail,
                payment_method: {
                    type: transactionData.paymentMethod.type,
                    token: transactionData.paymentMethod.token,
                    installments: transactionData.paymentMethod.installments || 1
                },
                reference: transactionData.reference,
                customer_data: transactionData.customerData,
                redirect_url: transactionData.redirectUrl
            }
        });
    }

    /**
     * Consultar una transacción
     */
    async getTransaction(transactionId) {
        return this.request(`transactions/${transactionId}`, {
            method: 'GET',
            usePublicKey: true
        });
    }

    /**
     * Obtener métodos de pago disponibles
     */
    async getPaymentMethods(amountInCents) {
        const params = new URLSearchParams({
            public_key: this.publicKey
        });

        if (amountInCents) {
            params.append('amount_in_cents', amountInCents);
        }

        return this.request(`payment_methods?${params.toString()}`, {
            method: 'GET',
            usePublicKey: true
        });
    }

    /**
     * Crear fuente de pago PSE
     */
    async createPSESource(pseData) {
        return this.request('payment_sources', {
            method: 'POST',
            usePublicKey: true,
            body: {
                type: 'PSE',
                amount_in_cents: pseData.amountInCents,
                currency: pseData.currency || 'COP',
                customer_email: pseData.customerEmail,
                payment_method: {
                    type: 'PSE',
                    user_type: pseData.userType, // 0 = Persona, 1 = Empresa
                    user_legal_id_type: pseData.userLegalIdType, // CC, CE, NIT, etc.
                    user_legal_id: pseData.userLegalId,
                    financial_institution_code: pseData.bankCode,
                    payment_description: pseData.description
                },
                redirect_url: pseData.redirectUrl,
                reference: pseData.reference
            }
        });
    }

    /**
     * Obtener lista de bancos PSE
     */
    async getPSEBanks() {
        return this.request('pse/financial_institutions', {
            method: 'GET',
            usePublicKey: true
        });
    }

    /**
     * Crear link de pago
     */
    async createPaymentLink(linkData) {
        return this.request('payment_links', {
            method: 'POST',
            usePrivateKey: true,
            body: {
                name: linkData.name,
                description: linkData.description,
                single_use: linkData.singleUse || false,
                collect_shipping: linkData.collectShipping || false,
                currency: linkData.currency || 'COP',
                amount_in_cents: linkData.amountInCents,
                redirect_url: linkData.redirectUrl,
                expires_at: linkData.expiresAt // ISO 8601 format
            }
        });
    }
}

/**
 * Inicializar cliente de API de Wompi
 */
export function initializeWompiAPI(config = {}) {
    if (!window.wompiAPIClient) {
        window.wompiAPIClient = new WompiAPIClient(config);
    }
    return window.wompiAPIClient;
}

export default WompiAPIClient;
