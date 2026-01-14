# 🎬 Alex Design Films - Sitio Web Oficial

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

Sitio web oficial de **Alex Design Films** - Producción audiovisual profesional, servicios de diseño y agentes de IA.

## 🌟 Características

- ✨ **Single Page Application (SPA)** moderna con URLs limpias
- 🎨 **Diseño responsivo** optimizado para todos los dispositivos
- 🛒 **Tienda integrada** con sistema de carrito de compras
- 💳 **Pagos seguros** mediante integración con Bold Payments
- 🤖 **Sección de Agentes IA** con servicios especializados
- 📱 **Navegación fluida** sin recargas de página
- 🔒 **Backend seguro** para procesamiento de pagos

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 14.0.0
- npm >= 6.0.0
- Python 3.x (opcional, para servidor de desarrollo)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/alex-design-films-website.git
   cd alex-design-films-website
   ```

2. **Instala las dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` y agrega tus credenciales de Bold:
   ```env
   BOLD_API_KEY=tu_api_key_aqui
   BOLD_SECRET_KEY=tu_secret_key_aqui
   ```

4. **Inicia el backend**
   ```bash
   npm start
   ```

5. **Inicia el frontend** (en otra terminal)
   
   **Opción A - Servidor Python (Recomendado):**
   ```bash
   python server.py
   ```
   
   **Opción B - Live Server (VS Code):**
   - Instala la extensión "Live Server"
   - Click derecho en `index.html` → "Open with Live Server"

6. **Abre tu navegador**
   ```
   http://localhost:8000
   ```

## 📁 Estructura del Proyecto

```
alex-design-films-website/
├── assets/                    # Recursos estáticos
│   ├── components/           # Componentes HTML reutilizables
│   ├── css/                  # Estilos CSS
│   ├── js/                   # Scripts JavaScript
│   ├── images/               # Imágenes
│   └── fonts/                # Fuentes personalizadas
├── backend/                   # Servidor Node.js
│   ├── server.js             # Servidor Express
│   ├── package.json          # Dependencias del backend
│   ├── .env.example          # Plantilla de variables de entorno
│   └── .gitignore            # Archivos ignorados del backend
├── index.html                # Página principal
├── firebase.json             # Configuración de Firebase
├── .htaccess                 # Configuración de Apache
├── .gitignore                # Archivos ignorados globales
└── README.md                 # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript (ES6+)** - Lógica de aplicación
- **History API** - Navegación SPA con URLs limpias

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **CORS** - Manejo de peticiones cross-origin
- **Helmet** - Seguridad HTTP
- **dotenv** - Gestión de variables de entorno
- **express-rate-limit** - Limitación de peticiones

### Pagos
- **Bold Payments** - Pasarela de pagos colombiana

## 📖 Documentación Adicional

- [📘 Guía de Instalación Completa](GUIA_INSTALACION.md)
- [🚀 Guía de Deploy a Producción](GUIA_DEPLOY_PRODUCCION.md)
- [💳 Integración de Bold Payments](BOLD_PAYMENT_INTEGRATION.md)
- [🔗 Configuración de URLs Limpias](README_URLS_LIMPIAS.md)
- [✅ Checklist de Implementación](CHECKLIST.md)

## 🌐 Rutas Disponibles

- `/` o `/inicio` - Página de inicio
- `/servicios` - Servicios de producción audiovisual
- `/agentes-ia` - Agentes de inteligencia artificial
- `/tienda` - Tienda de productos y servicios
- `/contacto` - Formulario de contacto
- `/carrito` - Carrito de compras

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a Git. Este archivo contiene credenciales sensibles.

- Las credenciales de Bold se almacenan en variables de entorno
- El backend valida todas las peticiones
- Se implementa rate limiting para prevenir abusos
- Headers de seguridad con Helmet
- CORS configurado correctamente

## 🚀 Deploy a Producción

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

Ver la [Guía de Deploy](GUIA_DEPLOY_PRODUCCION.md) para instrucciones detalladas.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

**Álvaro Alexander - Alex Design Films**

- Website: [alexdesignfilms.com](https://alexdesignfilms.com)
- Email: contacto@alexdesignfilms.com

## 🙏 Agradecimientos

- Bold Payments por su excelente API
- La comunidad de desarrolladores web
- Todos los que han contribuido al proyecto

---

⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub!
