from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import sessions, game, fishing, shop
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from pathlib import Path

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Cozy Aquarium Game API")
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
app.include_router(game.router, prefix="/api", tags=["game"])
app.include_router(fishing.router, prefix="/api", tags=["fishing"])
app.include_router(shop.router, prefix="/api", tags=["shop"])


@app.get("/")
async def root():
    static_index = Path(os.getenv("STATIC_DIR", "/app/static")) / "index.html"
    if static_index.exists():
        return FileResponse(static_index, headers={"Cache-Control": "no-cache"})
    return {"status": "ok", "version": "3.0", "name": "Cozy Aquarium Game"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the built React app in the single-container production image."""
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    static_dir = Path(os.getenv("STATIC_DIR", "/app/static")).resolve()
    index_file = static_dir / "index.html"
    requested = (static_dir / full_path).resolve()

    if not index_file.exists():
        raise HTTPException(status_code=404, detail="Not found")

    if requested.is_file() and static_dir in requested.parents:
        headers = {}
        if full_path.startswith("assets/"):
            headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return FileResponse(requested, headers=headers)

    if full_path.startswith("assets/"):
        raise HTTPException(status_code=404, detail="Asset not found")

    return FileResponse(index_file, headers={"Cache-Control": "no-cache"})
