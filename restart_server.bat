@echo off
REM Script para reiniciar el servidor web optimizado

echo ============================================================
echo Deteniendo servidores en puerto 8000...
echo ============================================================

REM Buscar y matar procesos en puerto 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Deteniendo proceso %%a...
    taskkill /F /PID %%a 2>nul
)

echo.
echo ============================================================
echo Esperando 2 segundos...
echo ============================================================
timeout /t 2 /nobreak >nul

echo.
echo ============================================================
echo Iniciando servidor optimizado...
echo ============================================================
python server.py

pause
