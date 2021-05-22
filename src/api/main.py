from fastapi import FastAPI, status
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from api.v1.api import api_router
from celery import Celery

from common.resources.s3 import get_s3_client
from common.resources.database import conn, crud
from common.resources.workers import get_celery_workers

# middleware = [
#     Middleware(
#         CORSMiddleware,
#         #allow_origins='*',
#         allow_origins=["http://localhost", "http://localhost:3000", "http://localhost:5000"],
#         #allow_origin_regex='https?://.*',
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
#     )
# ]

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
    redoc_url="/docs",
    #middleware=middleware
)

ALLOWED_ORIGINS = '*'
ALLOWED_METHODS = 'POST, GET, DELETE, OPTIONS'
ALLOWED_HEADERS = 'Authorization, Content-Type'



@app.on_event("startup")
async def startup():
    # Store S3 connection as global variable in application state
    # access elsewhere using 'request.app.state.s3client'
    app.state.s3client = get_s3_client()

    # Make buckets if they don't exist.
    [ app.state.s3client.make_bucket(b) for b in ["audio-wav", "audio-mp3", "features-npy"] if not app.state.s3client.bucket_exists(b) ]

    # Create database tables and views if they don't exist
    conn.Base.metadata.create_all(bind=conn.engine)
    crud.create_views(conn.SessionLocal())

    # Register Celery workers
    app.state.workers = get_celery_workers()
#
# def check_routes(request):
#     # Using FastAPI instance
#     url_list = [
#         route.path
#         for route in request.app.routes
#         if "rest_of_path" not in route.path
#     ]
#     if request.url.path not in url_list:
#         return JSONResponse({"detail": "Not Found"}, status.HTTP_404_NOT_FOUND)
#
# # Handle CORS preflight requests
# @app.options("/{rest_of_path:path}")
# async def preflight_handler(request, rest_of_path):
#     response = check_routes(request)
#     if response:
#         return response
#
#     response = Response(
#         content="OK",
#         media_type="text/plain",
#         headers={
#             "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
#             "Access-Control-Allow-Methods": ALLOWED_METHODS,
#             "Access-Control-Allow-Headers": ALLOWED_HEADERS,
#         },
#     )
#     return response
#
# # Add CORS headers
# @app.middleware("http")
# async def add_cors_header(request, call_next):
#     response = check_routes(request)
#     if response:
#         return response
#
#     response = await call_next(request)
#     print('Adding headers')
#     response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGINS
#     response.headers["Access-Control-Allow-Methods"] = ALLOWED_METHODS
#     response.headers["Access-Control-Allow-Headers"] = ALLOWED_HEADERS
#     return response



app.include_router(api_router, prefix="/v1")

app_full = CORSMiddleware(
    app=app,
    #allow_origins='*',
    allow_origins=["http://localhost", "http://localhost:3000", "http://localhost:5000"],
    #allow_origin_regex='https?://.*',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
