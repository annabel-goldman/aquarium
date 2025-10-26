from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import sessions, tanks
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Aquarium API V2")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


# Include routers with /api prefix
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(tanks.router, prefix="/api", tags=["tanks"])


@app.get("/")
async def root():
    return {"status": "ok", "version": "2.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

