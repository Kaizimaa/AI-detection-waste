@echo off
echo Starting Waste Detection System...
echo.

echo [1/3] Starting Python Backend...
start "Python Backend" cmd /k "cd /d %~dp0 && python python_backend_example.py"

echo [2/3] Waiting for Python backend to start...
timeout /t 3 /nobreak > nul

echo [3/3] Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd /d %~dp0 && npm run build"

echo.
echo Both systems are starting...
echo Python Backend: http://localhost:5000
echo Next.js Frontend: http://localhost:3000
echo.
echo Press any key to open the application...
pause > nul
start http://localhost:3000 