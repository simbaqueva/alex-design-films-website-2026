# 🚀 INICIO RÁPIDO - Deploy a GitHub

## ⚡ Opción 1: Script Automatizado (Recomendado)

Abre PowerShell en esta carpeta y ejecuta:

```powershell
.\deploy-to-github.ps1
```

El script te guiará paso a paso. Solo necesitas:
- ✅ Tu nombre de usuario de GitHub
- ✅ Nombre del repositorio que quieres crear

---

## 💻 Opción 2: Manual (Paso a Paso)

### 1. Configurar Git (solo la primera vez)

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 2. Crear repositorio en GitHub

Ve a: https://github.com/new
- Nombre: `alex-design-films-website`
- ⚠️ NO marques "Initialize with README"

### 3. Subir el código

```powershell
# Inicializar Git
git init

# Agregar archivos
git add .

# Crear commit
git commit -m "🎬 Initial commit - Alex Design Films"

# Configurar rama
git branch -M main

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/alex-design-films-website.git

# Subir a GitHub
git push -u origin main
```

---

## ✅ Verificación

Después de subir, verifica que NO aparezcan:
- ❌ `backend/.env`
- ❌ `node_modules/`
- ❌ `node-installer.msi`

---

## 📚 Más Información

- 📖 Análisis completo: `ANALISIS_SITIO_WEB.md`
- 📘 Guía detallada: `GITHUB_DEPLOY.md`
- 🚀 Deploy a producción: `GUIA_DEPLOY_PRODUCCION.md`

---

## 🆘 ¿Problemas?

Si tienes errores, lee `GITHUB_DEPLOY.md` sección "Solución de Problemas"
