from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Loading Environment Variables
load_dotenv()

# Falls back to a local SQLite file if DATABASE_URL isn't set in .env, so the
# backend starts with zero setup instead of crashing with
# "ArgumentError: Expected string or URL object, got None" the way it did
# when this env var was missing/misnamed. Set DATABASE_URL in .env (e.g. to
# a Postgres URL) to use a real database server instead.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# SQLite only allows a connection to be used by the thread that created it by
# default, which breaks under FastAPI/Starlette's threaded request handling.
# This has no effect for non-SQLite URLs (e.g. Postgres).
connect_args = (
    {"check_same_thread": False}
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite")
    else {}
)

# Creating SQLAlchemy Engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

# Creating Session Local Class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Creating Base Class for Models
Base = declarative_base()

# The get_db function will be used to get a database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
