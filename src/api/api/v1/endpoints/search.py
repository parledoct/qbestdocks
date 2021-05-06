from fastapi import APIRouter, Depends, Request, HTTPException

from typing import List
from uuid import UUID
from schemas.search import SearchParameters, SearchJob, SearchResult

from sqlalchemy.orm import Session
from common.resources.database.conn import get_db
import common.resources.database.crud as crud

from celery import chain
from celery.result import AsyncResult

router = APIRouter()

@router.post("/", summary="Create search job", response_model = SearchJob, status_code=201)
async def create_search_job(request: Request, search_parameters: SearchParameters, db: Session = Depends(get_db)):

    """
    Compare a list of queries (regions of annotated audio) on against a list of files (regions on untranscribed audio where acoustic activity is detected).
    Returns a `search_uuid` of the job and job state (see [https://docs.celeryproject.org/en/stable/reference/celery.states.html](https://docs.celeryproject.org/en/stable/reference/celery.states.html)).
    """

    search_uuid = crud.create_search_job(db, **search_parameters.dict())

    workers = request.app.state.workers

    res = chain(
        workers.signature('audio.tasks.check_test_regions', kwargs = { 'search_uuid' : search_uuid } ),
        workers.signature('audio.tasks.check_feature_files'),
        workers.signature('audio.tasks.run_qbestd_search')
    ).apply_async(
        task_id = str(search_uuid)
    )

    return SearchJob( search_uuid=search_uuid, status = res.state )

@router.get("/status/{search_uuid}", summary = "Get job status", response_model = SearchJob, status_code=200)
async def get_job_status(request: Request, search_uuid: UUID):

    """
    Returns a `search_uuid` of the job and job state (see [https://docs.celeryproject.org/en/stable/reference/celery.states.html](https://docs.celeryproject.org/en/stable/reference/celery.states.html)).
    """

    res = AsyncResult(str(search_uuid))

    return SearchJob(search_uuid=search_uuid, status=res.state)

@router.get("/results/", summary = "Get job results", response_model = List[SearchResult], status_code=200)
async def get_job_status(request: Request, annot_uuid: str = None, file_uuid: str = None, db: Session = Depends(get_db)):

    """
    Returns list of search results associated with `annot_uuid` or `file_uuid`
    """

    matches = crud.get_search_results(db, annot_uuid, file_uuid)

    return [ SearchResult(**dict(match)) for match in matches ]
