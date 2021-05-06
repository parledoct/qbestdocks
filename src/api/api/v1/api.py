from fastapi import APIRouter

from api.v1.endpoints import audio
from api.v1.endpoints import annotations
from api.v1.endpoints import search

api_router = APIRouter()
api_router.include_router(audio.router, prefix="/audio", tags=["Audio"])
api_router.include_router(annotations.router, prefix="/annotations", tags=["Annotations"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
