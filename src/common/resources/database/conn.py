from os import getenv

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_db}".format(
    pg_user     = getenv("POSTGRES_USER", "postgres"),
    pg_password = getenv("POSTGRES_PASSWORD", "postgres"),
    pg_host     = getenv("POSTGRES_HOST", "127.0.0.1"),
    pg_port     = getenv("POSTGRES_PORT", "5432"),
    pg_db       = getenv("POSTGRES_DB", "postgres")
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base = declarative_base()
