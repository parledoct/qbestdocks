from fastapi import APIRouter

from api.v1.endpoints import audio
from api.v1.endpoints import annotations

api_router = APIRouter()
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(annotations.router, prefix="/annotations", tags=["annotations"])
