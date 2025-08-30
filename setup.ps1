Write-Output "?? Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

Write-Output "?? Installing frontend dependencies..."
cd frontend
npm install
cd ..

Write-Output "? Setup complete! Use `make dev` (if Make is installed) or run backend/frontend separately."
