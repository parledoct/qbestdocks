from fastapi import Query
from pydantic import BaseModel
from uuid import UUID

class AnnotationIn(BaseModel):
    id: UUID         = Query(None, description="Annotation identifier; not required if action is 'insert'")
    start_sec: float = Query(..., description="Start time of annotation, in seconds.")
    end_sec: float   = Query(..., description="End time of annotation, in seconds.")
    annotation: str  = Query(..., description="Annotation text.")
    action: str      = Query(None, description="Database action: 'insert', 'update', or 'delete'.")

    class Config:
        # Example for OpenAPI documentation
        schema_extra = {
            "example": {
                "id": "c3eca4a0-a7ca-11eb-93c4-0242ac170007",
                "annotation": "hello",
                "start_sec": 1.2,
                "end_sec": 3.5,
                "action": "update"
            }
        }

class AnnotationOut(BaseModel):
    id: UUID = Query(..., description="If the action was 'insert', this value will be the identifier generated on insertion")
    start_sec: float
    end_sec: float
    annotation: str

    class Config:
        # Example for OpenAPI documentation
        schema_extra = {
            "example": {
                "id": "c3eca4a0-a7ca-11eb-93c4-0242ac170007",
                "start_sec": 1.2,
                "end_sec": 3.5,
                "annotation": "hello"
            }
        }
