/**
 * ===================================
   BACKEND SEGURO PARA BOLD PAYMENTS
   ===================================
 * Servidor Express con endpoints seguros para:
 * - Generar hash de integridad
 * - Recibir webhooks de Bold
 * - Validar transacciones
 */

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

// Helmet: Protección de headers HTTP
app.use(helmet({
    contentSecurityPolicy: false, // Desactivar CSP para desarrollo
    crossOriginEmbedderPolicy: false
}));

// CORS: Permitir solo tu dominio frontend
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting: Prevenir abuso de API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// UTILIDADES
// ============================================

/**
 * Generar hash SHA256 para integridad de Bold
 */
function generateBoldHash(orderId, currency, amount, secretKey) {
    const dataToHash = `${orderId}${currency}${amount}${secretKey}`;
    return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

/**
 * Validar datos requeridos
 */
function validateRequiredFields(data, fields) {
    const missing = fields.filter(field => !data[field]);
    return {
        valid: missing.length === 0,
        missing: missing
    };
}

/**
 * Logger mejorado
 */
function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        level,
        message,
        ...data
    };
    console.log(JSON.stringify(logData, null, 2));
}

// ============================================
// ENDPOINTS DE SALUD
// ============================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Alex Design Films - Bold Payment Backend',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            generateHash: 'POST /api/bold/generate-hash',
            webhook: 'POST /webhooks/bold-payment'
        }
    });
});

// ============================================
// ENDPOINTS DE BOLD PAYMENT
// ============================================

/**
 * POST /api/bold/generate-hash
 * Genera el hash de integridad para una transacción
 */
app.post('/api/bold/generate-hash', async (req, res) => {
    try {
        const { orderId, currency, amount } = req.body;

        // Validar campos requeridos
        const validation = validateRequiredFields(req.body, ['orderId', 'currency', 'amount']);
        if (!validation.valid) {
            log('warn', 'Missing required fields', { missing: validation.missing });
            return res.status(400).json({
                success: false,
                error: 'Campos requeridos faltantes',
                missing: validation.missing
            });
        }

        // Validar que amount sea un número
        if (isNaN(amount) || amount <= 0) {
            log('warn', 'Invalid amount', { amount });
            return res.status(400).json({
                success: false,
                error: 'El monto debe ser un número positivo'
            });
        }

        // Obtener Secret Key desde variables de entorno
        const secretKey = process.env.BOLD_SECRET_KEY;

        if (!secretKey) {
            log('error', 'BOLD_SECRET_KEY not configured');
            return res.status(500).json({
                success: false,
                error: 'Error de configuración del servidor'
            });
        }

        // Generar hash
        const hash = generateBoldHash(orderId, currency, amount, secretKey);

        log('info', 'Hash generated successfully', {
            orderId,
            currency,
            amount
        });

        res.json({
            success: true,
            hash: hash,
            orderId: orderId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        log('error', 'Error generating hash', {
            error: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

/**
 * POST /webhooks/bold-payment
 * Recibe notificaciones de Bold sobre el estado de los pagos
 */
app.post('/webhooks/bold-payment', async (req, res) => {
    try {
        const webhookData = req.body;

        log('info', 'Webhook received from Bold', {
            id: webhookData.id,
            status: webhookData.status,
            orderId: webhookData.orderId
        });

        // TODO: Validar la firma del webhook de Bold
        // Bold envía una firma para verificar que el webhook es legítimo

        // TODO: Actualizar el estado del pedido en tu base de datos
        // Ejemplo:
        // await updateOrderStatus(webhookData.orderId, webhookData.status);

        // TODO: Enviar confirmación al cliente
        // Ejemplo:
        // if (webhookData.status === 'approved') {
        //     await sendConfirmationEmail(webhookData.orderId);
        // }

        // TODO: Ejecutar lógica de negocio adicional
        // - Generar factura
        // - Actualizar inventario
        // - Enviar notificaciones
        // - etc.

        // Responder a Bold que recibimos el webhook
        res.status(200).json({
            success: true,
            message: 'Webhook procesado correctamente',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        log('error', 'Error processing webhook', {
            error: error.message,
            stack: error.stack
        });

        // Aún así responder 200 a Bold para evitar reintentos
        res.status(200).json({
            success: false,
            message: 'Error procesando webhook',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/bold/transaction/:orderId
 * Consultar el estado de una transacción (opcional)
 */
app.get('/api/bold/transaction/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // TODO: Consultar el estado en tu base de datos
        // const transaction = await getTransactionByOrderId(orderId);

        // Por ahora, respuesta de ejemplo
        res.json({
            success: true,
            orderId: orderId,
            status: 'pending', // pending, approved, rejected, etc.
            message: 'Endpoint de ejemplo - implementar con base de datos real'
        });

    } catch (error) {
        log('error', 'Error querying transaction', {
            error: error.message,
            orderId: req.params.orderId
        });

        res.status(500).json({
            success: false,
            error: 'Error consultando transacción'
        });
    }
});

// ============================================
// MANEJO DE ERRORES
// ============================================

/**
 * 404 - Ruta no encontrada
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method
    });
});

/**
 * Error handler global
 */
app.use((err, req, res, next) => {
    log('error', 'Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path
    });

    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Bold Payment Backend Server');
    console.log('='.repeat(50));
    console.log(`📍 Server running on: http://${HOST}:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50) + '\n');

    // Verificar configuración
    if (!process.env.BOLD_SECRET_KEY) {
        console.warn('⚠️  WARNING: BOLD_SECRET_KEY not configured!');
        console.warn('⚠️  Set it in .env file before using in production\n');
    }

    if (!process.env.BOLD_API_KEY) {
        console.warn('⚠️  WARNING: BOLD_API_KEY not configured!');
        console.warn('⚠️  Set it in .env file\n');
    }
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    log('info', 'SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('info', 'SIGINT signal received: closing HTTP server');
    process.exit(0);
});

module.exports = app;
