# ============================================
# Script de Deploy a GitHub - Alex Design Films
# ============================================

Write-Host "🎬 Alex Design Films - Deploy a GitHub" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar que Git esté instalado
Write-Host "📋 Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git instalado: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Git no está instalado" -ForegroundColor Red
    Write-Host "   Descarga Git desde: https://git-scm.com/downloads" -ForegroundColor Yellow
    pause
    exit 1
}

# Configurar Git si no está configurado
Write-Host "🔧 Configurando Git..." -ForegroundColor Yellow
$userName = git config --global user.name 2>$null
$userEmail = git config --global user.email 2>$null

if (-not $userName -or -not $userEmail) {
    Write-Host "⚠️  Git no está configurado. Necesito algunos datos:`n" -ForegroundColor Yellow
    
    $nombre = Read-Host "   Tu nombre completo (ej: Álvaro Alexander)"
    $email = Read-Host "   Tu email de GitHub (ej: tu@email.com)"
    
    git config --global user.name "$nombre"
    git config --global user.email "$email"
    
    Write-Host "✅ Git configurado correctamente`n" -ForegroundColor Green
} else {
    Write-Host "✅ Git ya configurado:" -ForegroundColor Green
    Write-Host "   Nombre: $userName" -ForegroundColor Gray
    Write-Host "   Email: $userEmail`n" -ForegroundColor Gray
}

# Solicitar información del repositorio
Write-Host "📝 Información del Repositorio`n" -ForegroundColor Yellow
$githubUser = Read-Host "   Tu nombre de usuario de GitHub"
$repoName = Read-Host "   Nombre del repositorio (default: alex-design-films-website)"

if (-not $repoName) {
    $repoName = "alex-design-films-website"
}

$repoUrl = "https://github.com/$githubUser/$repoName.git"

Write-Host "`n🔍 Verificando archivos sensibles..." -ForegroundColor Yellow

# Verificar que .gitignore existe
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Error: .gitignore no encontrado" -ForegroundColor Red
    pause
    exit 1
}

# Verificar que .env no será subido
if (Test-Path "backend\.env") {
    Write-Host "⚠️  Archivo .env detectado (será ignorado por .gitignore)" -ForegroundColor Yellow
}

Write-Host "`n🚀 Iniciando proceso de deploy..." -ForegroundColor Cyan

# Inicializar Git si no está inicializado
if (-not (Test-Path ".git")) {
    Write-Host "   Inicializando repositorio Git..." -ForegroundColor Gray
    git init
    Write-Host "✅ Repositorio inicializado`n" -ForegroundColor Green
} else {
    Write-Host "✅ Repositorio Git ya existe`n" -ForegroundColor Green
}

# Agregar archivos
Write-Host "📦 Agregando archivos..." -ForegroundColor Yellow
git add .

# Verificar qué se va a subir
Write-Host "`n📋 Archivos que se subirán:" -ForegroundColor Cyan
git status --short

Write-Host "`n⚠️  IMPORTANTE: Verifica que NO aparezca:" -ForegroundColor Yellow
Write-Host "   - backend/.env" -ForegroundColor Red
Write-Host "   - node_modules/" -ForegroundColor Red
Write-Host "   - node-installer.msi`n" -ForegroundColor Red

$continuar = Read-Host "¿Todo se ve bien? (S/N)"

if ($continuar -ne "S" -and $continuar -ne "s") {
    Write-Host "`n❌ Deploy cancelado" -ForegroundColor Red
    pause
    exit 0
}

# Crear commit
Write-Host "`n💾 Creando commit..." -ForegroundColor Yellow
git commit -m "🎬 Initial commit - Alex Design Films website"

# Renombrar rama a main
Write-Host "🔄 Configurando rama principal..." -ForegroundColor Yellow
git branch -M main

# Agregar remote
Write-Host "🌐 Conectando con GitHub..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $repoUrl

# Mostrar instrucciones finales
Write-Host "`n✅ ¡Casi listo!" -ForegroundColor Green
Write-Host "`n📋 PASOS FINALES:" -ForegroundColor Cyan
Write-Host "   1. Ve a: https://github.com/new" -ForegroundColor White
Write-Host "   2. Nombre del repositorio: $repoName" -ForegroundColor White
Write-Host "   3. Descripción: Sitio web oficial de Alex Design Films" -ForegroundColor White
Write-Host "   4. Visibilidad: Public o Private (tu elección)" -ForegroundColor White
Write-Host "   5. ⚠️  NO marques 'Initialize with README'" -ForegroundColor Yellow
Write-Host "   6. Click en 'Create repository'`n" -ForegroundColor White

$creado = Read-Host "¿Ya creaste el repositorio en GitHub? (S/N)"

if ($creado -eq "S" -or $creado -eq "s") {
    Write-Host "`n🚀 Subiendo código a GitHub..." -ForegroundColor Cyan
    
    try {
        git push -u origin main
        
        Write-Host "`n✅ ¡ÉXITO! Tu código está en GitHub" -ForegroundColor Green
        Write-Host "`n🌐 Ver tu repositorio en:" -ForegroundColor Cyan
        Write-Host "   https://github.com/$githubUser/$repoName`n" -ForegroundColor White
        
        Write-Host "📚 Próximos pasos:" -ForegroundColor Yellow
        Write-Host "   - Revisa tu repositorio en GitHub" -ForegroundColor Gray
        Write-Host "   - Considera hacer deploy en Vercel/Netlify/Firebase" -ForegroundColor Gray
        Write-Host "   - Lee GUIA_DEPLOY_PRODUCCION.md para más info`n" -ForegroundColor Gray
        
    } catch {
        Write-Host "`n❌ Error al subir a GitHub" -ForegroundColor Red
        Write-Host "   Posibles soluciones:" -ForegroundColor Yellow
        Write-Host "   1. Verifica que creaste el repositorio en GitHub" -ForegroundColor Gray
        Write-Host "   2. Verifica tu nombre de usuario: $githubUser" -ForegroundColor Gray
        Write-Host "   3. Puede que necesites autenticarte con GitHub CLI:" -ForegroundColor Gray
        Write-Host "      gh auth login`n" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⏸️  Deploy pausado" -ForegroundColor Yellow
    Write-Host "   Cuando hayas creado el repositorio, ejecuta:" -ForegroundColor Gray
    Write-Host "   git push -u origin main`n" -ForegroundColor White
}

Write-Host "🎬 Script finalizado" -ForegroundColor Cyan
pause
