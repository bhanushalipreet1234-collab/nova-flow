#!/bin/bash
echo "?? Installing backend dependencies..."
cd backend && pip install -r requirements.txt || pip install -e .
cd ..

echo "?? Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo "? Setup complete! Run `make dev` to start both backend and frontend."
