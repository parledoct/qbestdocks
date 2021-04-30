from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class FileStatus(BaseModel):
    file_id: UUID
    upload_filename: str
    message: Optional[str] = None

class UploadFileStatus(BaseModel):

    processed: List[FileStatus] = []
    skipped: List[FileStatus] = []

    class Config:
        schema_extra = {
            "example": {
                "processed": [
                    {
                        "file_id": "cfcb209c-a83a-11eb-bcbc-0242ac130002",
                        "upload_filename": "queries.wav"
                    }
                ],
                "skipped": [
                    {
                        "file_id": "64a90e88-a83e-11eb-bcbc-0242ac130002",
                        "upload_filename": "tests.wav",
                        "message": "File already on server"
                    }
                ]
            }
        }
