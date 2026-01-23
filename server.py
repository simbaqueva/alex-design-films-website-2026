#!/usr/bin/env python3
"""
Servidor HTTP optimizado para SPA (Single Page Application)
Con caché, compresión, proxy para Wompi y mejor rendimiento
"""
import http.server
import socketserver
import os
import gzip
import io
import json
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta
from email.utils import formatdate

class OptimizedSPAHandler(http.server.SimpleHTTPRequestHandler):
    """Handler optimizado con caché y compresión"""
    
    # Extensiones que se pueden comprimir
    COMPRESSIBLE_TYPES = {
        '.html', '.css', '.js', '.json', '.xml', '.svg', '.txt'
    }
    
    # Configuración de caché por tipo de archivo (en segundos)
    CACHE_TIMES = {
        '.html': 0,  # No cachear HTML para SPA routing
        '.css': 31536000,  # 1 año para CSS
        '.js': 31536000,   # 1 año para JS
        '.png': 2592000,   # 30 días para imágenes
        '.jpg': 2592000,
        '.jpeg': 2592000,
        '.gif': 2592000,
        '.svg': 2592000,
        '.ico': 2592000,
        '.woff': 31536000,  # 1 año para fuentes
        '.woff2': 31536000,
        '.ttf': 31536000,
    }
    
    def end_headers(self):
        """Añadir headers de caché y compresión antes de enviar"""
        # Obtener extensión del archivo
        _, ext = os.path.splitext(self.path)
        
        # Configurar caché
        cache_time = self.CACHE_TIMES.get(ext.lower(), 3600)  # Default 1 hora
        if cache_time > 0:
            self.send_header('Cache-Control', f'public, max-age={cache_time}')
            # Calcular fecha de expiración
            expires = datetime.utcnow() + timedelta(seconds=cache_time)
            self.send_header('Expires', formatdate(expires.timestamp(), usegmt=True))
        else:
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        # Headers de seguridad
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        
        super().end_headers()
    
    def do_GET(self):
        """Manejar GET con soporte para SPA routing, compresión y proxy de Wompi"""
        # Si es una petición al proxy de Wompi, manejarla
        if self.path.startswith('/api/wompi/'):
            self.handle_wompi_proxy_get()
            return
        
        # Traducir la ruta para verificar si el archivo existe
        file_path = self.translate_path(self.path)
        
        # Si es la raíz, servir index.html
        if self.path == '/':
            self.serve_with_compression()
            return
        
        # Si el archivo existe físicamente, servirlo
        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.serve_with_compression()
            return
        
        # Si es un directorio que existe, buscar index.html dentro
        if os.path.exists(file_path) and os.path.isdir(file_path):
            index_path = os.path.join(file_path, 'index.html')
            if os.path.exists(index_path):
                self.path = self.path.rstrip('/') + '/index.html'
                self.serve_with_compression()
                return
        
        # Para cualquier otra ruta (rutas SPA como /carrito, /tienda, etc.)
        # servir index.html
        self.path = '/index.html'
        self.serve_with_compression()
    
    def do_POST(self):
        """Manejar peticiones POST - principalmente para proxy de Wompi"""
        # Solo permitir proxy para rutas específicas de Wompi
        if self.path.startswith('/api/wompi/'):
            self.handle_wompi_proxy()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_wompi_proxy(self):
        """Proxy para peticiones a la API de Wompi"""
        try:
            # Leer el cuerpo de la petición
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b''
            
            # Extraer la ruta de Wompi (remover /api/wompi/)
            wompi_path = self.path.replace('/api/wompi/', '')
            
            # URL base de Wompi (PRODUCCIÓN - pagos reales)
            wompi_base_url = 'https://production.wompi.co/v1/'
            target_url = wompi_base_url + wompi_path
            
            print(f"🔄 Proxy Wompi: {wompi_path}")
            
            # Preparar headers para la petición a Wompi
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Si hay un Authorization header, pasarlo
            if 'Authorization' in self.headers:
                headers['Authorization'] = self.headers['Authorization']
            
            # Hacer la petición a Wompi
            req = urllib.request.Request(
                target_url,
                data=post_data,
                headers=headers,
                method='POST'
            )
            
            # Ejecutar la petición
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read()
                response_code = response.getcode()
                
                # Enviar respuesta al cliente
                self.send_response(response_code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.send_header('Content-Length', str(len(response_data)))
                self.end_headers()
                self.wfile.write(response_data)
                
                print(f"✅ Proxy Wompi exitoso: {response_code}")
                
        except urllib.error.HTTPError as e:
            # Error HTTP de Wompi
            error_data = e.read()
            print(f"❌ Error Wompi HTTP {e.code}: {error_data.decode('utf-8', errors='ignore')}")
            
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(error_data)))
            self.end_headers()
            self.wfile.write(error_data)
            
        except Exception as e:
            # Error general
            error_msg = json.dumps({'error': str(e)}).encode('utf-8')
            print(f"❌ Error en proxy Wompi: {str(e)}")
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(error_msg)))
            self.end_headers()
            self.wfile.write(error_msg)
    
    def handle_wompi_proxy_get(self):
        """Proxy para peticiones GET a la API de Wompi"""
        try:
            # Extraer la ruta de Wompi (remover /api/wompi/)
            wompi_path = self.path.replace('/api/wompi/', '')
            
            # URL base de Wompi (PRODUCCIÓN - pagos reales)
            wompi_base_url = 'https://production.wompi.co/v1/'
            target_url = wompi_base_url + wompi_path
            
            print(f"🔄 Proxy Wompi GET: {wompi_path}")
            
            # Preparar headers para la petición a Wompi
            headers = {
                'Accept': 'application/json'
            }
            
            # Si hay un Authorization header, pasarlo
            if 'Authorization' in self.headers:
                headers['Authorization'] = self.headers['Authorization']
            
            # Hacer la petición a Wompi
            req = urllib.request.Request(
                target_url,
                headers=headers,
                method='GET'
            )
            
            # Ejecutar la petición
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read()
                response_code = response.getcode()
                
                # Enviar respuesta al cliente
                self.send_response(response_code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.send_header('Content-Length', str(len(response_data)))
                self.end_headers()
                self.wfile.write(response_data)
                
                print(f"✅ Proxy Wompi GET exitoso: {response_code}")
                
        except urllib.error.HTTPError as e:
            # Error HTTP de Wompi
            error_data = e.read()
            print(f"❌ Error Wompi HTTP {e.code}: {error_data.decode('utf-8', errors='ignore')}")
            
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(error_data)))
            self.end_headers()
            self.wfile.write(error_data)
            
        except Exception as e:
            # Error general
            error_msg = json.dumps({'error': str(e)}).encode('utf-8')
            print(f"❌ Error en proxy Wompi GET: {str(e)}")
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(error_msg)))
            self.end_headers()
            self.wfile.write(error_msg)

    
    def do_OPTIONS(self):
        """Manejar peticiones OPTIONS para CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    
    def serve_with_compression(self):
        """Servir archivo con compresión gzip si es apropiado"""
        # Obtener la ruta del archivo
        path = self.translate_path(self.path)
        
        # Verificar si el archivo existe
        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return
        
        if os.path.isdir(path):
            # Si es directorio, buscar index.html
            index_path = os.path.join(path, 'index.html')
            if os.path.exists(index_path):
                path = index_path
            else:
                self.send_error(404, "File not found")
                return
        
        # Leer el archivo
        try:
            with open(path, 'rb') as f:
                content = f.read()
        except IOError:
            self.send_error(404, "File not found")
            return
        
        # Verificar si debemos comprimir
        _, ext = os.path.splitext(path)
        accept_encoding = self.headers.get('Accept-Encoding', '')
        should_compress = (
            ext.lower() in self.COMPRESSIBLE_TYPES and
            'gzip' in accept_encoding and
            len(content) > 1024  # Solo comprimir si es mayor a 1KB
        )
        
        # Comprimir si es apropiado
        if should_compress:
            # Comprimir contenido
            buf = io.BytesIO()
            with gzip.GzipFile(fileobj=buf, mode='wb', compresslevel=6) as gz:
                gz.write(content)
            compressed_content = buf.getvalue()
            
            # Solo usar compresión si realmente reduce el tamaño
            if len(compressed_content) < len(content):
                content = compressed_content
                self.send_response(200)
                self.send_header('Content-Encoding', 'gzip')
            else:
                self.send_response(200)
        else:
            self.send_response(200)
        
        # Enviar headers
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        
        # Enviar contenido
        self.wfile.write(content)
    
    def log_message(self, format, *args):
        """Logging más limpio"""
        # Solo mostrar errores y requests importantes
        if '404' in str(args) or '500' in str(args):
            super().log_message(format, *args)
        # Comentar la siguiente línea para ver todos los requests
        # else:
        #     super().log_message(format, *args)


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    """Servidor con soporte para múltiples threads"""
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    # Cambiar al directorio del script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    PORT = 8000
    
    print("=" * 60)
    print("🚀 Servidor SPA Optimizado")
    print("=" * 60)
    print(f"📡 Puerto: {PORT}")
    print(f"📁 Directorio: {os.getcwd()}")
    print(f"🌐 URL: http://localhost:{PORT}")
    print("=" * 60)
    print("✨ Características:")
    print("  • Caché HTTP optimizado")
    print("  • Compresión gzip automática")
    print("  • Soporte multi-thread")
    print("  • SPA routing")
    print("=" * 60)
    print("Presiona Ctrl+C para detener")
    print("=" * 60)
    
    try:
        with ThreadedTCPServer(("", PORT), OptimizedSPAHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor detenido")
