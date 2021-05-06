from fastapi import FastAPI
from api.v1.api import api_router
from celery import Celery 

from common.resources.s3 import get_s3_client
from common.resources.database.conn import Base, engine, SQLALCHEMY_DATABASE_URL
from common.resources.workers import get_celery_workers

app = FastAPI(
    title="QbE-STD API",
    description="Application Programming Interface for Query-by-Example Spoken Term Detection",
    version="0.1.0",
    openapi_tags=[
        {
            "name": "Audio",
            "description": "Audio-related endpoints."
        },
        {
            "name": "Annotations",
            "description": "Annotation-related endpoints."
        },
        {
            "name": "Search",
            "description": "Search-related endpoints."
        }
    ],
    docs_url=None,
    redoc_url="/docs"
)

@app.on_event("startup")
async def startup():
    # Store S3 connection as global variable in application state
    # access elsewhere using 'request.app.state.s3client'
    app.state.s3client = get_s3_client()

    # Make buckets if they don't exist.
    [ app.state.s3client.make_bucket(b) for b in ["audio-wav", "audio-mp3", "features-npy"] if not app.state.s3client.bucket_exists(b) ]

    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Register Celery workers
    app.state.workers = get_celery_workers()

app.include_router(api_router, prefix="/v1")
