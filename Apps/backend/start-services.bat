@echo off
echo Starting Healthcare FYP Backend Services...
echo.

echo Starting RabbitMQ (if not running)...
echo Please ensure RabbitMQ is running on localhost:5672
echo.

echo Starting Auth Service...
start "Auth Service" cmd /k "cd apps\auth && npm run start:dev"

timeout /t 5 /nobreak > nul

echo Starting Doctor Service...
start "Doctor Service" cmd /k "cd apps\doctor && npm run start:dev"

timeout /t 5 /nobreak > nul

echo Starting Gateway Service...
start "Gateway Service" cmd /k "cd apps\gateway && npm run start:dev"

timeout /t 5 /nobreak > nul

echo Starting Notification Service...
start "Notification Service" cmd /k "cd apps\notification && npm run start:dev"

timeout /t 5 /nobreak > nul

echo Starting Pharmacy Service...
start "Pharmacy Service" cmd /k "cd apps\pharmacy && npm run start:dev"

echo.
echo All services are starting...
echo.
echo Services will be available at:
echo - Gateway: http://localhost:3000
echo - Auth Service: RabbitMQ queue 'auth_queue'
echo - Doctor Service: RabbitMQ queue 'doctor_queue'
echo - Notification Service: RabbitMQ queue 'notification_queue'
echo - Pharmacy Service: RabbitMQ queue 'pharmacy_queue'
echo.
echo Press any key to exit...
pause > nul
