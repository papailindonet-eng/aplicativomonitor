# CS2 Launch Fix: Disable Administrator Mode on `cs2.exe`

Se **Run this program as an administrator** estiver marcado no `cs2.exe`, desmarque e salve.

## Opção automática (recomendada)

Use o script `cs2_fix_admin_and_launch.bat` para:

1. Remover a flag `RUNASADMIN` do `cs2.exe` no Registro do Windows (HKCU/HKLM).
2. Abrir o CS2 pela Steam (`steam://rungameid/730`).

## Opção manual

1. Vá para:
   `Steam\steamapps\common\Counter-Strike Global Offensive\game\bin\win64`
2. Clique com o botão direito em `cs2.exe`.
3. Abra **Properties**.
4. Vá para a aba **Compatibility**.
5. Desmarque **Run this program as an administrator**.
6. Clique em **Apply** e **OK**.

Depois, abra a Steam e inicie o CS2 por **Library -> CS2 -> Play**.
