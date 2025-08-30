.PHONY: dev backend frontend test lint

dev:
@echo "?? Starting backend + frontend..."
# Run both backend and frontend in parallel (requires npm-run-all or use 2 terminals)
# For Windows, use: start cmd /k "cd backend && uvicorn main:app --reload"
# And: start cmd /k "cd frontend && npm run dev"

backend:
@echo "? Running backend (FastAPI)"
cd backend && uvicorn main:app --reload

frontend:
@echo "? Running frontend (Vite)"
cd frontend && npm run dev

test:
@echo "?? Running backend tests"
cd backend && pytest -v

lint:
@echo "?? Linting Python + TypeScript"
cd backend && flake8 .
cd frontend && npm run lint
