# Cozy Aquarium Game

A cozy fish tank game where you catch fish, dress them up with accessories, and maintain your tank.

## Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- SQLite (built into Python)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

By default, local backend data is stored in `aquarium.sqlite`. Set `SQLITE_PATH`
to use a different database file.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### With Docker

```bash
./scripts/docker-dev.sh
```

Access at: http://localhost:5173

### Production

The production setup builds one container that serves both the FastAPI API and
the React frontend, with SQLite persisted in a Docker volume:

```bash
./scripts/docker-prod-local.sh
```

Local production-style testing runs at: http://localhost:8080

Stop Docker services with:

```bash
./scripts/docker-down.sh
```

Set `COOKIE_SECURE=true` only when serving the app over HTTPS.

To migrate existing MongoDB data into SQLite before switching over:

```bash
cd backend
python -m pip install pymongo
MONGO_URI="mongodb://..." SQLITE_PATH="/data/aquarium.sqlite" python migrate_to_game.py
```
