from uuid import UUID

from fastapi import APIRouter, Depends, Request, HTTPException

from typing import List
from schemas.annotations import AnnotationIn, AnnotationOut

from sqlalchemy.orm import Session
from common.resources.database.conn import get_db
import common.resources.database.crud as crud

router = APIRouter()

@router.get("/", summary="Get annotation(s) associated with identifier", response_model=List[AnnotationOut], status_code=201)
async def get_annotations(request: Request, file_uuid: str = None, annot_uuid: str = None, db: Session = Depends(get_db)):
    """
    Get annotation(s) by file or annotation identifier, supply *either* `file_uuid` or `annot_uuid`. Note an array of size 1 is returned
    for when fetching via `annot_uuid`.
    """

    if file_uuid is None and annot_uuid is None:
        raise HTTPException(status_code=400, detail=f"Neither file_uuid nor annot_uuid provided for retrieval.")

    if file_uuid is not None:

        if not crud.file_exists(db, file_uuid):
            raise HTTPException(status_code=404, detail=f"File by identifier '{file_uuid}' not found in files table.")    

        annotations = crud.get_file_annotations(db, file_uuid=file_uuid)

    elif annot_uuid is not None:

        if not crud.annotation_exists(db, annot_uuid):
                raise HTTPException(status_code=404, detail=f"Annotation by identifier '{annot_uuid}' not found in annotations table.")

        annotations = crud.get_annotations(db, annot_uuid=annot_uuid)

    return [ AnnotationOut(**annotation.__dict__) for annotation in annotations ]

@router.post("/update/", summary="Update annotations", response_model=List[AnnotationOut], status_code=201)
async def update_annotations(request: Request, annotations: List[AnnotationIn], db: Session = Depends(get_db)):

    """
    Insert, update, or delete annotation(s). Parameters to be supplied as an array of annotations with a corresponding action.
    """

    updated_annotations = []

    for a in annotations:

        if a.action == "insert":

            if not crud.file_exists(db, a.file_uuid):
                raise HTTPException(status_code=404, detail=f"File by identifier '{a.file_uuid}' not found in files table.")    

            new_annotation = crud.create_annotation(db, a.file_uuid, a.start_sec, a.end_sec, a.annotation)
            a.annot_uuid   =  new_annotation.annot_uuid

        elif a.action == "update":

            if not crud.annotation_exists(db, a.annot_uuid):
                raise HTTPException(status_code=404, detail=f"Annotation by identifier '{a.annot_uuid}' not found in annotations table.")

            crud.update_annotation(db, a.annot_uuid, a.start_sec, a.end_sec, a.annotation)

        elif a.action == "delete":

            if not crud.annotation_exists(db, a.annot_uuid):
                raise HTTPException(status_code=404, detail=f"Annotation by identifier '{a.annot_uuid}' not found in annotations table.")    

            crud.delete_annotation(db, a.annot_uuid)
            a.start_sec = -1
            a.end_sec   = -1
            a.annotation = "(annotation deleted)"

        else:

            raise HTTPException(status_code=400, detail=f"Action '{a.action}' not recognised.")

        updated_annotations.append(a)

    return updated_annotations
