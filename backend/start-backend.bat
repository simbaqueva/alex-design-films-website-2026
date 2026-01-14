@echo off
REM ===================================
REM SCRIPT DE INICIO - BOLD PAYMENT BACKEND
REM ===================================

echo.
echo ========================================
echo   Bold Payment Backend - Inicio
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo.
    echo Por favor, instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Mostrar versión de Node.js
echo [INFO] Node.js version:
node --version
echo.

REM Verificar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm no esta instalado
    pause
    exit /b 1
)

REM Verificar si existe package.json
if not exist "package.json" (
    echo [ERROR] package.json no encontrado
    echo.
    echo Asegurate de ejecutar este script desde la carpeta 'backend'
    echo.
    pause
    exit /b 1
)

REM Verificar si existe .env
if not exist ".env" (
    echo [ADVERTENCIA] Archivo .env no encontrado
    echo.
    echo Creando .env desde .env.example...
    copy .env.example .env >nul
    echo.
    echo [IMPORTANTE] Edita el archivo .env y configura tus credenciales de Bold
    echo.
    echo Presiona cualquier tecla para abrir .env en el editor...
    pause >nul
    notepad .env
    echo.
)

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas correctamente
    echo.
)

REM Iniciar el servidor
echo ========================================
echo   Iniciando servidor backend...
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Usar npm run dev si existe nodemon, sino npm start
npm run dev

REM Si el servidor se detiene
echo.
echo ========================================
echo   Servidor detenido
echo ========================================
echo.
pause
