from fastapi import Query
from pydantic import BaseModel
from typing import List
from uuid import UUID

class SearchParameters(BaseModel):
    annot_uuids: List[UUID]
    file_uuids: List[UUID]

    class Config:
        # Make SearchParameters object convertible to/from SearchJob ORM model (see common.resources.database.models)
        orm_mode = True

        # Example for OpenAPI documentation
        schema_extra = {
            "example": {
                "annot_uuids": [
                    "497f6eca-6276-4993-bfeb-53cbbbba6f08", "9d56173d-eff7-4ad4-923f-57fb2816800a"
                    ],
                    "file_uuids": [
                        "497f6eca-6276-4993-bfeb-53cbbbba6f08", "2ed3611f-9737-437f-8a63-7b1ed868085d"
                    ]
            }
        }

class SearchJob(BaseModel):
    search_uuid: UUID
    status: str = Query(..., description="Job state, returned by Celery.")

    class Config:
        # Example for OpenAPI documentation
        schema_extra = {
            "example": {
                "search_uuid": "44c82457-2388-48ec-890d-e6f71fa0a2f4",
                "status": "PENDING"
            }
        }

class SearchResult(BaseModel):
    result_uuid: UUID
    annot_uuid: UUID
    test_uuid: UUID
    annotation: str
    file_uuid: UUID
    test_start_sec: float = Query(..., description="Start time of test region within wav file (given by file_uuid).")
    test_end_sec: float = Query(..., description="End time of test region within wav file (given by file_uuid).")
    match_start_sec: float = Query(..., description="Start time of matched region relative to start of test region.")
    match_end_sec: float = Query(..., description="End time of matched region relative to start of test region.")
    match_score: float = Query(..., description="Similarity score of matched region to annotation.")

    class Config:

        # Example for OpenAPI documentation
        schema_extra = {
            "example": {
                "result_uuid": "f80dda21-6ffe-42f0-bf5a-f86d8ea6e6c2",
                "annot_uuid": "14e1f506-99fc-49d2-908b-57aaf7348fbd",
                "annotation": "hello",
                "test_uuid": "d27a199c-b747-4850-af5e-4a007f91efb9",
                "file_uuid": "f8e009a6-6911-41da-98d0-fee9e838b64d",
                "test_start_sec": 0.2,
                "test_end_sec": 2.15,
                "match_start_sec": 0.12,
                "match_end_sec": 0.49,
                "match_score": 0.956
            }
        }
