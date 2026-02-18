@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =====================================================
REM Automação Windows: backend + app mobile (Expo)
REM =====================================================

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "MOBILE_DIR=%ROOT_DIR%mobile"

if not exist "%BACKEND_DIR%" (
  echo [ERRO] Pasta backend nao encontrada em: %BACKEND_DIR%
  exit /b 1
)

if not exist "%MOBILE_DIR%" (
  echo [ERRO] Pasta mobile nao encontrada em: %MOBILE_DIR%
  exit /b 1
)

echo.
echo ==============================================
echo    Monitor UJF - Inicializacao automatica
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado no PATH.
  echo Instale Node.js 20+ e tente novamente.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado no PATH.
  exit /b 1
)

set /p APP_TOKEN=Digite o APP_TOKEN ^(padrao: change-me^): 
if "%APP_TOKEN%"=="" set "APP_TOKEN=change-me"

set "API_IP="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue ^| Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254*' -and $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Hyper-V|Virtual|VMware|WSL|Docker' }; if($ips){ $ips[0].IPAddress }"`) do (
  if not defined API_IP set "API_IP=%%I"
)

if not defined API_IP (
  for /f "tokens=2 delims=: " %%I in ('ipconfig ^| findstr /R /C:"IPv4"') do (
    if not defined API_IP set "API_IP=%%I"
  )
)

set "API_IP=!API_IP: =!"

if defined API_IP (
  echo IP local detectado automaticamente: !API_IP!
  set /p API_IP_INPUT=Pressione ENTER para usar este IP ou digite outro: 
  if not "!API_IP_INPUT!"=="" set "API_IP=!API_IP_INPUT!"
) else (
  echo [AVISO] Nao foi possivel detectar seu IP automaticamente.
  set /p API_IP=Digite o IP local do computador ^(ex: 192.168.0.10^): 
)

if "%API_IP%"=="" (
  echo [ERRO] IP nao informado.
  exit /b 1
)

set "API_URL=http://%API_IP%:4000/api"

echo.
echo [1/4] Preparando backend...
if not exist "%BACKEND_DIR%\.env" (
  if exist "%BACKEND_DIR%\.env.example" (
    copy /Y "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
  )
)

pushd "%BACKEND_DIR%"
if not exist "node_modules" (
  echo Instalando dependencias do backend...
  call npm install || (
    echo [ERRO] Falha no npm install do backend.
    popd
    exit /b 1
  )
)
popd

echo.
echo [2/4] Preparando mobile...
if not exist "%MOBILE_DIR%\.env" (
  if exist "%MOBILE_DIR%\.env.example" (
    copy /Y "%MOBILE_DIR%\.env.example" "%MOBILE_DIR%\.env" >nul
  )
)

(
  echo EXPO_PUBLIC_API_URL=%API_URL%
  echo EXPO_PUBLIC_API_TOKEN=%APP_TOKEN%
) > "%MOBILE_DIR%\.env"

pushd "%MOBILE_DIR%"
echo Sincronizando dependencias do mobile...
call npm install || (
  echo [ERRO] Falha no npm install do mobile.
  popd
  exit /b 1
)

if not exist "node_modules\expo-font" (
  echo Instalando pacote ausente expo-font...
  call npx expo install expo-font || (
    echo [ERRO] Falha ao instalar expo-font.
    popd
    exit /b 1
  )
)
popd


set "EXPO_VERSION_RAW="
for /f "usebackq delims=" %%V in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content -Raw '%MOBILE_DIR%\package.json' | ConvertFrom-Json).dependencies.expo"`) do (
  if not defined EXPO_VERSION_RAW set "EXPO_VERSION_RAW=%%V"
)

set "EXPO_SDK="
for /f "tokens=1 delims=.~" %%S in ("%EXPO_VERSION_RAW%") do set "EXPO_SDK=%%S"
if defined EXPO_SDK (
  echo.
  echo [INFO] Projeto configurado para Expo SDK %EXPO_SDK%.
  echo [INFO] Se o Expo Go do celular estiver em outra versao, instale a versao compativel em:
  echo [INFO] https://expo.dev/go?sdkVersion=%EXPO_SDK%^&platform=android^&device=true
)

echo.
echo [3/4] Iniciando backend em nova janela...
start "Backend Monitor UJF" cmd /k "cd /d ""%BACKEND_DIR%"" && set ""APP_TOKEN=%APP_TOKEN%"" && npm start"

echo.
echo [4/4] Iniciando Expo em nova janela...
start "Mobile Expo Monitor UJF" cmd /k "cd /d ""%MOBILE_DIR%"" && npm start"

echo.
echo Processo concluido.
echo - Backend: %API_URL%
echo - Token: %APP_TOKEN%
echo.
echo Abra o Expo Go no celular e escaneie o QR Code da janela do Expo.
echo.

endlocal
exit /b 0
