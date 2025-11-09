@echo off
echo ================================================
echo   MongoDB DNS Connection Fix for Windows
echo ================================================
echo.

echo [1/6] Flushing DNS cache...
ipconfig /flushdns
echo DNS cache flushed successfully!
echo.

echo [2/6] Releasing current IP configuration...
ipconfig /release
echo.

echo [3/6] Renewing IP configuration...
ipconfig /renew
echo.

echo [4/6] Resetting Winsock catalog...
netsh winsock reset
echo.

echo [5/6] Resetting TCP/IP stack...
netsh int ip reset
echo.

echo [6/6] Setting DNS servers to Google DNS...
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2
netsh interface ip set dns "Ethernet" static 8.8.8.8
netsh interface ip add dns "Ethernet" 8.8.4.4 index=2
echo.

echo ================================================
echo   DNS Fix Complete!
echo ================================================
echo.
echo IMPORTANT: Please restart your computer for all changes to take effect.
echo.
echo After restart, try connecting to MongoDB again.
echo If the issue persists, try using a mobile hotspot.
echo.
pause
