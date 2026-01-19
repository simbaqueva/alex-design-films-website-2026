"""
===================================
WOMPI WEBHOOK ENDPOINT
===================================
Endpoint seguro para recibir notificaciones de Wompi

⚠️ IMPORTANTE: Este endpoint NO procesa datos sensibles
Solo recibe notificaciones del estado de los pagos
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import hashlib
import hmac
from datetime import datetime
import os

# ========================================
# CONFIGURACIÓN
# ========================================
# Secret de eventos para sandbox (pruebas)
WOMPI_EVENTS_SECRET_TEST = 'test_events_bZ28XnCltG3ZrKL5tzMdfpxivX8A1ITD'

# Secret de eventos para producción
WOMPI_EVENTS_SECRET_PROD = 'prod_events_bZ28XnCltG3ZrKL5tzMdfpxivX8A1ITD'

# Usar sandbox por defecto
USE_SANDBOX = True

# Seleccionar el secret apropiado según el modo
WOMPI_EVENTS_SECRET = WOMPI_EVENTS_SECRET_TEST if USE_SANDBOX else WOMPI_EVENTS_SECRET_PROD

PORT = 8080

# ========================================
# ALMACENAMIENTO SIMPLE (archivo JSON)
# ========================================
TRANSACTIONS_FILE = 'transactions.json'

def load_transactions():
    """Cargar transacciones desde archivo"""
    if os.path.exists(TRANSACTIONS_FILE):
        with open(TRANSACTIONS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_transaction(transaction_data):
    """Guardar transacción en archivo"""
    transactions = load_transactions()
    transactions.append(transaction_data)
    
    with open(TRANSACTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(transactions, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Transacción guardada: {transaction_data['reference']}")

# ========================================
# WEBHOOK HANDLER
# ========================================
class WompiWebhookHandler(BaseHTTPRequestHandler):
    
    def do_POST(self):
        """Manejar POST requests de Wompi"""
        
        # Solo aceptar requests en /webhook
        if self.path != '/webhook':
            self.send_error(404)
            return
        
        try:
            # Leer el contenido del request
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parsear JSON
            webhook_data = json.loads(post_data.decode('utf-8'))
            
            # Verificar firma (seguridad)
            if not self.verify_signature(post_data, self.headers.get('X-Event-Signature', '')):
                print("❌ Firma inválida - request rechazado")
                self.send_error(401, "Invalid signature")
                return
            
            # Procesar el evento
            self.process_webhook_event(webhook_data)
            
            # Responder con éxito
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode())
            
        except Exception as e:
            print(f"❌ Error procesando webhook: {e}")
            self.send_error(500, str(e))
    
    def verify_signature(self, payload, signature):
        """
        Verificar firma del webhook para seguridad
        Wompi firma los webhooks con HMAC-SHA256
        """
        if not WOMPI_EVENTS_SECRET or WOMPI_EVENTS_SECRET == 'test_events_xxxxxx':
            print("⚠️ WARNING: Usando secret de prueba - configurar en producción")
            return True  # En desarrollo, aceptar sin verificar
        
        # Calcular firma esperada
        expected_signature = hmac.new(
            WOMPI_EVENTS_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def process_webhook_event(self, event_data):
        """
        Procesar evento del webhook
        
        DATOS QUE RECIBE (NO SENSIBLES):
        - event: tipo de evento (transaction.updated)
        - data: información de la transacción
          - id: ID de la transacción
          - reference: Referencia única
          - status: Estado (APPROVED, DECLINED, PENDING, etc.)
          - amount_in_cents: Monto en centavos
          - currency: Moneda (COP)
          - payment_method_type: Tipo de pago (CARD, NEQUI, PSE)
          - created_at: Fecha de creación
        
        NO RECIBE:
        ❌ Números de tarjeta
        ❌ CVV
        ❌ Datos bancarios completos
        """
        
        event_type = event_data.get('event')
        transaction = event_data.get('data', {}).get('transaction', {})
        
        print(f"\n{'='*50}")
        print(f"📨 Webhook recibido: {event_type}")
        print(f"{'='*50}")
        
        # Extraer información relevante (NO SENSIBLE)
        transaction_info = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'transaction_id': transaction.get('id'),
            'reference': transaction.get('reference'),
            'status': transaction.get('status'),
            'amount': transaction.get('amount_in_cents', 0) / 100,
            'currency': transaction.get('currency'),
            'payment_method': transaction.get('payment_method_type'),
            'created_at': transaction.get('created_at'),
            'customer_email': transaction.get('customer_email', 'N/A')
        }
        
        # Mostrar información
        print(f"🆔 ID: {transaction_info['transaction_id']}")
        print(f"📋 Referencia: {transaction_info['reference']}")
        print(f"💰 Monto: ${transaction_info['amount']} {transaction_info['currency']}")
        print(f"📊 Estado: {transaction_info['status']}")
        print(f"💳 Método: {transaction_info['payment_method']}")
        print(f"📧 Email: {transaction_info['customer_email']}")
        
        # Guardar en archivo
        save_transaction(transaction_info)
        
        # Aquí puedes agregar lógica adicional según el estado:
        if transaction_info['status'] == 'APPROVED':
            print("✅ PAGO APROBADO - Procesar pedido")
            # TODO: Enviar email de confirmación
            # TODO: Actualizar inventario
            # TODO: Generar factura
            
        elif transaction_info['status'] == 'DECLINED':
            print("❌ PAGO RECHAZADO - Notificar al cliente")
            # TODO: Enviar email de rechazo
            
        elif transaction_info['status'] == 'PENDING':
            print("⏳ PAGO PENDIENTE - Esperar confirmación")
            # TODO: Enviar email de pendiente
        
        print(f"{'='*50}\n")
    
    def log_message(self, format, *args):
        """Personalizar logs"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

# ========================================
# SERVIDOR
# ========================================
def run_webhook_server():
    """Iniciar servidor de webhooks"""
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, WompiWebhookHandler)
    
    print(f"\n{'='*60}")
    print(f"🚀 Servidor de Webhooks de Wompi iniciado")
    print(f"{'='*60}")
    print(f"📡 Escuchando en: http://localhost:{PORT}/webhook")
    print(f"📁 Transacciones guardadas en: {TRANSACTIONS_FILE}")
    print(f"\n⚠️  IMPORTANTE:")
    print(f"   - Este endpoint NO procesa datos sensibles")
    print(f"   - Solo recibe notificaciones de estado de pagos")
    print(f"   - Configura WOMPI_EVENTS_SECRET en producción")
    print(f"\n💡 Para usar en producción:")
    print(f"   1. Despliega este servidor en un hosting")
    print(f"   2. Configura la URL en Wompi: https://tudominio.com/webhook")
    print(f"   3. Actualiza WOMPI_EVENTS_SECRET con tu secret real")
    print(f"\n{'='*60}\n")
    print(f"Presiona Ctrl+C para detener\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor detenido")
        httpd.server_close()

if __name__ == '__main__':
    run_webhook_server()
