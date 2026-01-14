/**
 * ===================================
   BOLD PAYMENT BACKEND EXAMPLE
   ===================================
 * Ejemplo de implementación backend para generar
 * el hash de integridad de forma segura
 * 
 * IMPORTANTE: Este es un ejemplo. Debes adaptarlo
 * a tu stack tecnológico específico.
 */

// ============================================
// EJEMPLO 1: Node.js con Express
// ============================================

/*
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

// Endpoint para generar hash de integridad
app.post('/api/bold/generate-hash', (req, res) => {
    try {
        const { orderId, currency, amount } = req.body;
        
        // Validar datos requeridos
        if (!orderId || !currency || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: orderId, currency, amount'
            });
        }
        
        // Obtener Secret Key desde variables de entorno
        const secretKey = process.env.BOLD_SECRET_KEY;
        
        if (!secretKey) {
            console.error('BOLD_SECRET_KEY not configured');
            return res.status(500).json({
                error: 'Payment configuration error'
            });
        }
        
        // Generar hash SHA256
        // Formato: SHA256(orderId + currency + amount + secretKey)
        const dataToHash = `${orderId}${currency}${amount}${secretKey}`;
        const hash = crypto
            .createHash('sha256')
            .update(dataToHash)
            .digest('hex');
        
        console.log('Hash generated for order:', orderId);
        
        res.json({
            success: true,
            hash: hash,
            orderId: orderId
        });
        
    } catch (error) {
        console.error('Error generating hash:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Endpoint para recibir webhooks de Bold
app.post('/webhooks/bold-payment', (req, res) => {
    try {
        const {
            id,
            status,
            orderId,
            amount,
            currency,
            createdAt
        } = req.body;
        
        console.log('Webhook received:', {
            id,
            status,
            orderId,
            amount
        });
        
        // TODO: Validar la firma del webhook
        // TODO: Actualizar el estado del pedido en tu base de datos
        // TODO: Enviar confirmación al cliente
        // TODO: Ejecutar lógica de negocio (enviar email, etc.)
        
        // Responder a Bold que recibimos el webhook
        res.status(200).json({
            success: true,
            message: 'Webhook processed'
        });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            error: 'Webhook processing failed'
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Bold Payment Backend running on port ${PORT}`);
});
*/


// ============================================
// EJEMPLO 2: Python con Flask
// ============================================

/*
from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')])

@app.route('/api/bold/generate-hash', methods=['POST'])
def generate_hash():
    try:
        data = request.get_json()
        
        order_id = data.get('orderId')
        currency = data.get('currency')
        amount = data.get('amount')
        
        # Validar datos requeridos
        if not all([order_id, currency, amount]):
            return jsonify({
                'error': 'Missing required fields: orderId, currency, amount'
            }), 400
        
        # Obtener Secret Key desde variables de entorno
        secret_key = os.getenv('BOLD_SECRET_KEY')
        
        if not secret_key:
            print('BOLD_SECRET_KEY not configured')
            return jsonify({
                'error': 'Payment configuration error'
            }), 500
        
        # Generar hash SHA256
        data_to_hash = f"{order_id}{currency}{amount}{secret_key}"
        hash_object = hashlib.sha256(data_to_hash.encode())
        hash_hex = hash_object.hexdigest()
        
        print(f'Hash generated for order: {order_id}')
        
        return jsonify({
            'success': True,
            'hash': hash_hex,
            'orderId': order_id
        })
        
    except Exception as e:
        print(f'Error generating hash: {str(e)}')
        return jsonify({
            'error': 'Internal server error'
        }), 500

@app.route('/webhooks/bold-payment', methods=['POST'])
def bold_webhook():
    try:
        data = request.get_json()
        
        print(f"Webhook received: {data}")
        
        # TODO: Validar la firma del webhook
        # TODO: Actualizar el estado del pedido en tu base de datos
        # TODO: Enviar confirmación al cliente
        
        return jsonify({
            'success': True,
            'message': 'Webhook processed'
        })
        
    except Exception as e:
        print(f'Error processing webhook: {str(e)}')
        return jsonify({
            'error': 'Webhook processing failed'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=True)
*/


// ============================================
// EJEMPLO 3: PHP
// ============================================

/*
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Cargar variables de entorno
require_once 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Endpoint para generar hash
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/api/bold/generate-hash') {
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $orderId = $input['orderId'] ?? null;
    $currency = $input['currency'] ?? null;
    $amount = $input['amount'] ?? null;
    
    // Validar datos requeridos
    if (!$orderId || !$currency || !$amount) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Missing required fields: orderId, currency, amount'
        ]);
        exit;
    }
    
    // Obtener Secret Key desde variables de entorno
    $secretKey = $_ENV['BOLD_SECRET_KEY'] ?? null;
    
    if (!$secretKey) {
        error_log('BOLD_SECRET_KEY not configured');
        http_response_code(500);
        echo json_encode([
            'error' => 'Payment configuration error'
        ]);
        exit;
    }
    
    // Generar hash SHA256
    $dataToHash = $orderId . $currency . $amount . $secretKey;
    $hash = hash('sha256', $dataToHash);
    
    error_log("Hash generated for order: $orderId");
    
    echo json_encode([
        'success' => true,
        'hash' => $hash,
        'orderId' => $orderId
    ]);
    exit;
}

// Endpoint para webhooks
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/webhooks/bold-payment') {
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("Webhook received: " . json_encode($input));
    
    // TODO: Validar la firma del webhook
    // TODO: Actualizar el estado del pedido en tu base de datos
    // TODO: Enviar confirmación al cliente
    
    echo json_encode([
        'success' => true,
        'message' => 'Webhook processed'
    ]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
?>
*/


// ============================================
// ARCHIVO .env EJEMPLO
// ============================================

/*
# Bold Payment Configuration
BOLD_API_KEY=your_api_key_here
BOLD_SECRET_KEY=your_secret_key_here

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=3001
NODE_ENV=development
*/


// ============================================
// INSTRUCCIONES DE USO
// ============================================

/*
1. Elige el ejemplo que corresponda a tu stack tecnológico
2. Copia el código a un nuevo archivo en tu backend
3. Instala las dependencias necesarias:
   
   Node.js:
   npm install express cors dotenv
   
   Python:
   pip install flask flask-cors python-dotenv
   
   PHP:
   composer require vlucas/phpdotenv

4. Crea un archivo .env con tus credenciales de Bold
5. Inicia el servidor backend
6. Actualiza la URL del endpoint en bold-payment.js:
   
   async generateIntegrityHash(orderId, currency, amount) {
       const response = await fetch('http://localhost:3001/api/bold/generate-hash', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ orderId, currency, amount })
       });
       const data = await response.json();
       return data.hash;
   }

7. Prueba la integración en ambiente de desarrollo
8. Configura el webhook en tu panel de Bold apuntando a:
   https://tudominio.com/webhooks/bold-payment
*/

module.exports = {
    // Este archivo es solo documentación/ejemplos
    // No contiene código ejecutable
};
