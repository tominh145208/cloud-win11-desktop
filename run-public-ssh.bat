@echo off
setlocal

title Win11 PUBLIC SSH run

echo Win11 PUBLIC SSH run
echo.
echo Dang tao link public (ngoai Internet) va luu vao public-links.txt
echo Neu chua co server local, script se tu khoi dong node server.js.
echo Giu cua so nay mo de link hoat dong.
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0start-public-link-ssh.ps1"

endlocal
