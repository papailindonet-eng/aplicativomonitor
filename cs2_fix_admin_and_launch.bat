@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM =============================================================
REM CS2 - Corrige "Executar como administrador" no cs2.exe e abre o jogo
REM =============================================================

set "CS2_EXE=%ProgramFiles(x86)%\Steam\steamapps\common\Counter-Strike Global Offensive\game\bin\win64\cs2.exe"

if not exist "%CS2_EXE%" (
  echo [AVISO] Nao encontrei o cs2.exe no caminho padrao:
  echo         "%CS2_EXE%"
  echo.
  set /p "CS2_EXE=Digite o caminho completo para o cs2.exe: "
)

if not exist "%CS2_EXE%" (
  echo [ERRO] Arquivo nao encontrado:
  echo        "%CS2_EXE%"
  echo.
  echo Encerrando sem alteracoes.
  exit /b 1
)

echo.
echo [INFO] Removendo flag RUNASADMIN para:
echo        "%CS2_EXE%"

REM Remove apenas o token RUNASADMIN e preserva outras flags de compatibilidade
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$exe = [Environment]::ExpandEnvironmentVariables('%CS2_EXE%');" ^
  "$paths = @('HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers','HKLM:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers');" ^
  "foreach ($k in $paths) {" ^
  "  $val = (Get-ItemProperty -LiteralPath $k -Name $exe -ErrorAction SilentlyContinue).$exe;" ^
  "  if ($null -ne $val) {" ^
  "    $tokens = @($val -split '\s+') | Where-Object { $_ -and $_ -ne 'RUNASADMIN' };" ^
  "    if ($tokens.Count -eq 0) { Remove-ItemProperty -LiteralPath $k -Name $exe -ErrorAction SilentlyContinue; Write-Host \"[OK] RUNASADMIN removido em $k (valor excluido)\"; }" ^
  "    else { $new = ($tokens -join ' '); Set-ItemProperty -LiteralPath $k -Name $exe -Value $new; Write-Host \"[OK] RUNASADMIN removido em $k (novo valor: $new)\"; }" ^
  "  } else { Write-Host \"[INFO] Nenhuma entrada em $k\"; }" ^
  "}"

if errorlevel 1 (
  echo [ERRO] Falha ao atualizar o registro.
  exit /b 1
)

echo.
echo [INFO] Abrindo CS2 pela Steam...
start "" "steam://rungameid/730"

echo [OK] Concluido.
exit /b 0
