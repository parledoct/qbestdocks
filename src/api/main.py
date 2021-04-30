from fastapi import FastAPI
from api.v1.api import api_router

from core.resources import MS3

# Create database tables (if they don't exist)
from core.models import models, database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="QbE-STD API",
    description="Application Programming Interface for Query-by-Example Spoken Term Detection",
    version="0.1.0",
    openapi_tags=[
        {
            "name": "audio",
            "description": "Audio-related endpoints."
        },
        {
            "name": "annotations",
            "description": "Annotation-related endpoints."
        }
    ],
    docs_url=None,
    redoc_url="/docs"
)

@app.on_event("startup")
async def startup():
    # Store S3 connection as global variable in application state
    app.state.s3client = MS3().client

app.include_router(api_router, prefix="/v1")
