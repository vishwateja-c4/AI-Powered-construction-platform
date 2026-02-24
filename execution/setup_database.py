"""
Database Setup Script
=====================
Initializes the SQLite database schema using SQLAlchemy models.

Usage:
    python execution/setup_database.py
"""

import sys
import os
from pathlib import Path

# Add backend directory to path so imports work
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(_PROJECT_ROOT))

# Now we can import the backend models
from backend.models.base import Base
from backend.models import *  # This makes sure all models are registered with Base
from sqlalchemy import create_engine

# Let's use SQLite directly for simplicity, mapped to the backend folder
DB_PATH = _PROJECT_ROOT / "backend" / "buildwise.db"
DB_URL = f"sqlite:///{DB_PATH.as_posix()}" # SQLite needs forward slashes

engine = create_engine(DB_URL, echo=True)

def init_db():
    print(f"Creating database schema at {DB_PATH}...")
    Base.metadata.create_all(bind=engine)
    print("Database schema created successfully.")

if __name__ == "__main__":
    init_db()
