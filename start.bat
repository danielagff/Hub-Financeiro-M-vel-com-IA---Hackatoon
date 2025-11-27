@echo off
echo ========================================
echo   Hackatoon FMU - Iniciando Servicos
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado!
    echo Por favor, instale o Docker Desktop.
    pause
    exit /b 1
)

echo Docker encontrado!
echo.

echo Iniciando servicos (MongoDB, PostgreSQL e App)...
docker-compose up

pause

