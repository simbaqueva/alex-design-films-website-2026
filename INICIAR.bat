@echo off
REM ============================================================
REM INICIAR SITIO WEB - ALEX DESIGN FILMS
REM ============================================================

echo.
echo ============================================================
echo   ALEX DESIGN FILMS - INICIO AUTOMATICO
echo ============================================================
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

echo [1/4] Verificando servidor...
echo.

REM Verificar si el servidor ya esta corriendo en puerto 8000
netstat -an | findstr :8000 | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Servidor ya esta corriendo en puerto 8000
    echo.
) else (
    echo [INFO] Iniciando servidor en puerto 8000...
    echo.
    
    REM Iniciar servidor en una nueva ventana
    start "Alex Design Films - Servidor Local" cmd /k "echo ============================================================ && echo   SERVIDOR LOCAL - ALEX DESIGN FILMS && echo ============================================================ && echo. && echo Servidor corriendo en: http://localhost:8000 && echo. && echo Presiona Ctrl+C para detener && echo ============================================================ && echo. && python server.py"
    
    echo [INFO] Esperando 3 segundos para que el servidor inicie...
    timeout /t 3 /nobreak >nul
    echo.
)

echo [2/4] Verificando que el servidor responde...
echo.

REM Esperar un poco mas si es necesario
timeout /t 2 /nobreak >nul

REM Verificar nuevamente
netstat -an | findstr :8000 | findstr LISTENING >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] El servidor no pudo iniciarse
    echo.
    echo Verifica que:
    echo - Python este instalado
    echo - El puerto 8000 no este bloqueado
    echo - No haya errores en server.py
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor respondiendo correctamente
echo.

echo [3/4] Abriendo navegador...
echo.

REM Abrir el navegador predeterminado
start http://localhost:8000

echo [OK] Navegador abierto
echo.

echo [4/4] Mostrando informacion...
echo.
echo ============================================================
echo   SITIO WEB INICIADO CORRECTAMENTE
echo ============================================================
echo.
echo URL Local:     http://localhost:8000
echo.
echo PAGINAS DISPONIBLES:
echo   - Inicio:      http://localhost:8000/
echo   - Servicios:   http://localhost:8000/servicios
echo   - Tienda:      http://localhost:8000/tienda
echo   - Agentes IA:  http://localhost:8000/agentes-ia
echo   - Tutoriales:  http://localhost:8000/tutoriales
echo   - Contacto:    http://localhost:8000/contacto
echo   - Carrito:     http://localhost:8000/carrito
echo.
echo ============================================================
echo   WOMPI - MODO SANDBOX
echo ============================================================
echo.
echo Wompi esta configurado en MODO SANDBOX (pruebas)
echo Puedes probar pagos directamente desde localhost
echo.
echo Tarjeta de prueba:
echo   Numero: 4242 4242 4242 4242
echo   Fecha: Cualquier fecha futura
echo   CVC: Cualquier 3 digitos
echo.
echo ============================================================
echo.
echo El servidor seguira corriendo en segundo plano.
echo Para detenerlo, cierra la ventana "Servidor Local"
echo.

pause
