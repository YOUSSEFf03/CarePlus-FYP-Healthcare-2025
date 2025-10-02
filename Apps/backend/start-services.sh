#!/bin/bash

echo "Starting Healthcare FYP Backend Services..."
echo

echo "Starting RabbitMQ (if not running)..."
echo "Please ensure RabbitMQ is running on localhost:5672"
echo

echo "Starting Auth Service..."
gnome-terminal -- bash -c "cd apps/auth && npm run start:dev; exec bash" &

sleep 5

echo "Starting Doctor Service..."
gnome-terminal -- bash -c "cd apps/doctor && npm run start:dev; exec bash" &

sleep 5

echo "Starting Gateway Service..."
gnome-terminal -- bash -c "cd apps/gateway && npm run start:dev; exec bash" &

sleep 5

echo "Starting Notification Service..."
gnome-terminal -- bash -c "cd apps/notification && npm run start:dev; exec bash" &

sleep 5

echo "Starting Pharmacy Service..."
gnome-terminal -- bash -c "cd apps/pharmacy && npm run start:dev; exec bash" &

echo
echo "All services are starting..."
echo
echo "Services will be available at:"
echo "- Gateway: http://localhost:3000"
echo "- Auth Service: RabbitMQ queue 'auth_queue'"
echo "- Doctor Service: RabbitMQ queue 'doctor_queue'"
echo "- Notification Service: RabbitMQ queue 'notification_queue'"
echo "- Pharmacy Service: RabbitMQ queue 'pharmacy_queue'"
echo
echo "Press Enter to exit..."
read
