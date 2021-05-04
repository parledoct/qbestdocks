from fastapi import Query
from pydantic import BaseModel
from uuid import UUID

class AnnotationIn(BaseModel):
    annot_uuid: UUID = Query(None, description="Annotation identifier; not required if action is 'insert'")
    start_sec: float = Query(..., description="Start time of annotation, in seconds.")
    end_sec: float   = Query(..., description="End time of annotation, in seconds.")
    annotation: str  = Query(..., description="Annotation text.")
    file_uuid: UUID  = Query(..., description="File identifier.")
    action: str      = Query(..., description="Database action: 'insert', 'update', or 'delete'.")

    class Config:
        # Example for OpenAPI documentation
        schema_extra = {
            "example": {
                    "annot_uuid": None,
                    "annotation": "hello",
                    "start_sec": 1.2,
                    "end_sec": 3.5,
                    "file_uuid": "23deccef-6fe3-41a0-8fb9-a68278caeb7b",
                    "action": "insert"
            }
        }

class AnnotationOut(BaseModel):
    annot_uuid: UUID = Query(..., description="If the action was 'insert', this value will be the identifier generated on insertion")
    start_sec: float
    end_sec: float
    annotation: str
    file_uuid: UUID

    class Config:
        orm_mode = True
        # Example for OpenAPI documentation
        schema_extra = {
            "example": {
                "annot_uuid": "c3eca4a0-a7ca-11eb-93c4-0242ac170007",
                "start_sec": 1.2,
                "end_sec": 3.5,
                "annotation": "hello",
                "file_uuid": "23deccef-6fe3-41a0-8fb9-a68278caeb7b"
            }
        }
