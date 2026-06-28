"""
SQLite persistence for Cozy Aquarium.

The game state is intentionally stored as compact JSON blobs. This keeps the
single-player-style game data small, migration-friendly, and cheap to load.
"""

from __future__ import annotations

from datetime import datetime
import json
import os
from pathlib import Path
import sqlite3
from threading import RLock
from typing import Any, Optional


DEFAULT_SQLITE_PATH = "/data/aquarium.sqlite" if Path("/data").exists() else "aquarium.sqlite"
SQLITE_PATH = os.getenv("SQLITE_PATH", os.getenv("DATABASE_PATH", DEFAULT_SQLITE_PATH))

_conn: Optional[sqlite3.Connection] = None
_lock = RLock()


def _json_default(value: Any) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def _to_json(value: Any) -> str:
    return json.dumps(value, default=_json_default, separators=(",", ":"))


def _from_json(value: Optional[str], default: Any) -> Any:
    if value is None:
        return default
    return json.loads(value)


def _connect() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        db_path = Path(SQLITE_PATH)
        if db_path.parent and str(db_path.parent) != ".":
            db_path.parent.mkdir(parents=True, exist_ok=True)
        _conn = sqlite3.connect(str(db_path), check_same_thread=False)
        _conn.row_factory = sqlite3.Row
    return _conn


async def connect_to_mongo():
    """Initialize the SQLite database.

    The function name is kept as a compatibility alias for the existing app
    startup wiring.
    """
    conn = _connect()
    with _lock:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password_hash TEXT,
                game_state TEXT,
                tank TEXT,
                fish TEXT NOT NULL DEFAULT '[]',
                owned_accessories TEXT NOT NULL DEFAULT '[]',
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.commit()


async def close_mongo_connection():
    """Close the SQLite connection."""
    global _conn
    if _conn is not None:
        with _lock:
            _conn.close()
            _conn = None


def get_database():
    """Compatibility shim for old Mongo-based code paths."""
    return None


def sqlite_path() -> str:
    return SQLITE_PATH


def _row_to_user(row: sqlite3.Row) -> dict:
    user = {
        "username": row["username"],
        "password_hash": row["password_hash"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "fish": _from_json(row["fish"], []),
        "ownedAccessories": _from_json(row["owned_accessories"], []),
    }
    game_state = _from_json(row["game_state"], None)
    tank = _from_json(row["tank"], None)
    if game_state is not None:
        user["gameState"] = game_state
    if tank is not None:
        user["tank"] = tank
    return user


async def get_user(username: str) -> Optional[dict]:
    conn = _connect()
    with _lock:
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,),
        ).fetchone()
    return _row_to_user(row) if row else None


async def save_user(user: dict) -> None:
    conn = _connect()
    with _lock:
        conn.execute(
            """
            INSERT INTO users (
                username, password_hash, game_state, tank, fish,
                owned_accessories, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
                password_hash = excluded.password_hash,
                game_state = excluded.game_state,
                tank = excluded.tank,
                fish = excluded.fish,
                owned_accessories = excluded.owned_accessories,
                created_at = excluded.created_at,
                updated_at = excluded.updated_at
            """,
            (
                user["username"],
                user.get("password_hash"),
                _to_json(user.get("gameState")) if "gameState" in user else None,
                _to_json(user.get("tank")) if "tank" in user else None,
                _to_json(user.get("fish", [])),
                _to_json(user.get("ownedAccessories", [])),
                _json_default(user.get("createdAt")) if user.get("createdAt") else None,
                _json_default(user.get("updatedAt")) if user.get("updatedAt") else None,
            ),
        )
        conn.commit()


async def user_exists(username: str) -> bool:
    return await get_user(username) is not None
