# 🚀 Guía Rápida de Deploy a GitHub

Esta guía te ayudará a subir tu proyecto a GitHub paso a paso.

## 📋 Prerrequisitos

1. **Git instalado** en tu sistema
   - Descarga desde: https://git-scm.com/downloads
   - Verifica con: `git --version`

2. **Cuenta de GitHub**
   - Crea una cuenta en: https://github.com

3. **Git configurado** con tu información
   ```bash
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu@email.com"
   ```

## 🔐 Paso 1: Verificar Archivos Sensibles

✅ **Ya está hecho!** El archivo `.gitignore` ya está configurado para proteger:
- ❌ `backend/.env` (credenciales de Bold)
- ❌ `node_modules/` (dependencias)
- ❌ `node-installer.msi` (archivo pesado)
- ❌ Archivos temporales y de sistema

## 🌐 Paso 2: Crear Repositorio en GitHub

### Opción A: Desde la Web (Recomendado)

1. Ve a https://github.com/new
2. Completa:
   - **Repository name**: `alex-design-films-website`
   - **Description**: `Sitio web oficial de Alex Design Films`
   - **Visibilidad**: 
     - ✅ **Public** (recomendado para portafolio)
     - 🔒 **Private** (si prefieres mantenerlo privado)
   - ⚠️ **NO marques** "Initialize with README" (ya tenemos uno)
3. Click en **"Create repository"**

### Opción B: Desde la Terminal (Avanzado)

```bash
# Requiere GitHub CLI instalado
gh repo create alex-design-films-website --public --source=. --remote=origin
```

## 💻 Paso 3: Subir el Código

Abre PowerShell en la carpeta de tu proyecto y ejecuta:

```powershell
# 1. Inicializar Git (si no está inicializado)
git init

# 2. Agregar todos los archivos (respetando .gitignore)
git add .

# 3. Crear el primer commit
git commit -m "🎬 Initial commit - Alex Design Films website"

# 4. Renombrar la rama a 'main' (estándar moderno)
git branch -M main

# 5. Conectar con tu repositorio de GitHub
# ⚠️ REEMPLAZA 'TU_USUARIO' con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/alex-design-films-website.git

# 6. Subir el código a GitHub
git push -u origin main
```

## ✅ Paso 4: Verificar

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/alex-design-films-website`
2. Deberías ver todos tus archivos
3. Verifica que **NO** aparezca:
   - ❌ `backend/.env`
   - ❌ `node_modules/`
   - ❌ `node-installer.msi`

## 🔄 Actualizaciones Futuras

Cuando hagas cambios en el código:

```powershell
# 1. Ver qué archivos cambiaron
git status

# 2. Agregar los cambios
git add .

# 3. Crear un commit descriptivo
git commit -m "✨ Descripción de tus cambios"

# 4. Subir a GitHub
git push
```

## 🌍 Paso 5: Deploy a Producción (Opcional)

### Firebase Hosting (Gratis)

```powershell
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto
firebase init hosting

# Deploy
firebase deploy
```

### Vercel (Gratis)

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Deploy (sigue las instrucciones)
vercel
```

### Netlify (Gratis)

1. Ve a https://app.netlify.com
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Click en "Deploy"

## 🆘 Solución de Problemas

### Error: "remote origin already exists"

```powershell
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/alex-design-films-website.git
```

### Error: "failed to push some refs"

```powershell
# Forzar el push (solo si estás seguro)
git push -u origin main --force
```

### Error: "Permission denied"

Necesitas autenticarte. Opciones:
1. **GitHub CLI** (recomendado): `gh auth login`
2. **Personal Access Token**: Crea uno en GitHub Settings → Developer settings → Personal access tokens

## 📞 ¿Necesitas Ayuda?

Si tienes problemas, dime:
1. ✅ Tu nombre de usuario de GitHub
2. ✅ El mensaje de error exacto que recibes
3. ✅ En qué paso estás

---

**¡Listo!** Tu código estará seguro en GitHub y podrás compartirlo con el mundo 🚀
