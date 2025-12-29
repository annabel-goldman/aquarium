# Cozy Aquarium Game

A cozy fish tank game where you catch fish, dress them up with accessories, and maintain your tank.

## Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (running locally or connection string)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### With Docker

```bash
docker-compose up
```

Access at: http://localhost:5173
