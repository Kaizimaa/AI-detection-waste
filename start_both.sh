#!/bin/bash

echo "Starting Waste Detection System..."
echo

echo "[1/3] Starting Python Backend..."
python3 python_backend_example.py &
PYTHON_PID=$!

echo "[2/3] Waiting for Python backend to start..."
sleep 3

echo "[3/3] Starting Next.js Frontend..."
npm run dev &
NEXTJS_PID=$!

echo
echo "Both systems are starting..."
echo "Python Backend: http://localhost:5000"
echo "Next.js Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both systems"

# Function to cleanup on exit
cleanup() {
    echo "Stopping systems..."
    kill $PYTHON_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 