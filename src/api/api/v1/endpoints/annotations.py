from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile, Query, Request, HTTPException
from fastapi.responses import Response, StreamingResponse

from typing import List
from core.schemas.annotations import AnnotationIn, AnnotationOut

from sqlalchemy.orm import Session
from core.models import crud, models, database

router = APIRouter()

@router.get("/", summary="Get annotation(s) associated with identifier", response_model=List[AnnotationOut], status_code=201)
async def get_annotations(request: Request, file_id: str = None, annotation_id: str = None, db: Session = Depends(database.get_db)):
    """
    Get annotation(s) by file or annotation identifier, supply *either* `file_id` or `annotation_id`.
    """

    if file_id is not None:

        if not crud.file_exists(db, file_id):
            raise HTTPException(status_code=404, detail=f"File by identifier '{file_id}' not found in files table.")    

        return crud.get_annotation(db, file_uuid=file_id)

    elif annotation_id is not None:

        if not crud.annotation_exists(db, annotation_id):
                raise HTTPException(status_code=404, detail=f"Annotation by identifier '{annotation_id}' not found in annotations table.")

        return crud.get_annotation(db, annot_uuid=annotation_id)

    else:

        raise HTTPException(status_code=400, detail=f"Neither file_id nor annotation_id provided for retrieval.")

@router.post("/update/{file_id}", summary="Update annotations by file id", response_model=List[AnnotationOut], status_code=201)
async def update_annotations(request: Request, file_id: UUID, annotations: List[AnnotationIn], db: Session = Depends(database.get_db)):

    if not crud.file_exists(db, file_id):
        raise HTTPException(status_code=404, detail=f"File by identifier '{file_id}' not found in files table.")    

    updated_annotations = []

    for a in annotations:

        if a.action == "insert":

            updated_annotations.append(
                crud.create_annotation(db, file_id, a.start_sec, a.end_sec, a.annotation)
            )

        elif a.action == "update":

            if not crud.annotation_exists(db, a.id):
                raise HTTPException(status_code=404, detail=f"Annotation by identifier '{a.id}' not found in annotations table.")

            updated_annotations.append(
                crud.update_annotation(db, a.id, a.start_sec, a.end_sec, a.annotation)
            )

        elif a.action == "delete":

            if not crud.annotation_exists(db, a.id):
                raise HTTPException(status_code=404, detail=f"Annotation by identifier '{a.id}' not found in annotations table.")    

            updated_annotations.append(
                crud.delete_annotation(db, a.id)
            )

        else:

            raise HTTPException(status_code=400, detail=f"Action '{a.action}' not recognised.")

    return updated_annotations
