import io, os, shutil

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Request
from fastapi.responses import Response, StreamingResponse

from typing import List, Optional
from schemas.audio import FileStatus, FileStatusesOut

from sqlalchemy.orm import Session
from common.resources.database.conn import get_db
from common.resources.database import conn, crud, models

from helpers import wav_to_s3files, generate_file_md5
from pydub import AudioSegment

router = APIRouter()

@router.get("/list", summary="List audio files", response_model=List[FileStatus])
async def get_all_audio(request: Request, db: Session = Depends(get_db)):
    """

    """
    files = crud.get_files(db)
    return [ FileStatus(**file.__dict__) for file in files ]

@router.get("/mp3/", summary="Fetch mp3 audio by identifier", response_class=Response(media_type="audio/mp3"))
def get_mp3_audio(request: Request, file_uuid: str = None, annot_uuid: str = None, start_sec: Optional[float] = None, end_sec: Optional[float] = None, db: Session = Depends(conn.get_db)):

    """
    Get annotation(s) by file or annotation identifier, supply *either* `file_uuid` or `annot_uuid`.
    If `annot_uuid` is used, `start_sec` and `end_sec` will automatically be fetched from the database.
    """

    if file_uuid is None and annot_uuid is None:
        raise HTTPException(status_code=400, detail="Either file_uuid or annot_uuid must be supplied.")

    if annot_uuid is not None:

        annotation = crud.get_annotation(db, annot_uuid=annot_uuid)

        if annotation is None:
            raise HTTPException(status_code=404, detail=f"Annotation by identifier '{annot_uuid}' does not exist.")
        else:
            file_uuid = annotation.file_uuid
            start_sec = annotation.start_sec
            end_sec   = annotation.end_sec

    tmp_path = f"/tmp/{file_uuid}.mp3"

    if os.path.isfile(tmp_path) is not True:
        # Fetch from s3 and save to /tmp to cache data (in case audio needed again)
        request.app.state.s3client.fget_object("audio-mp3", f"{file_uuid}.mp3", tmp_path)

    utterance = AudioSegment.from_mp3(tmp_path)

    # Clip utterance audio using either annotation boundaries or specified boundaries
    # Return whole utterance (0 to utterance duration) if neither specified
    start_ms  = start_sec * 1000 if start_sec is not None else 0
    end_ms    = end_sec * 1000 if end_sec is not None else utterance.duration_seconds * 1000
    utterance = utterance[start_ms:end_ms]

    buffer = io.BytesIO()
    utterance.export(buffer, format="mp3")

    return StreamingResponse(buffer, media_type="audio/mp3")

@router.post("/upload/", summary="Upload .wav files", response_model=FileStatusesOut)
async def upload_wav_files(request: Request, files: List[UploadFile] = File(...), db: Session = Depends(conn.get_db)):

    """
    Upload and process a set .wav files selected by the user. If the file according to its
    md5 hash already exists on the configured S3 bucket, it will be skipped. Similary, for
    any other validations errors (e.g. not a wav file), the file will be added to the skip
    list with an appropriate message.

    Otherwise, the processing component will convert the .wav files to 16 kHz mono and then
    upload the downsampled .wav and .mp3 versions of the audio to the configured S3 bucket,
    and issue UUIDs for each file (IDs returned in the response).
    """

    # Dictionary where md5 hashes are keys and associated file_uuid are values, e.g.
    # { "1a56c89d418333a3fbfa50c99953ff8c" : UUID("d404b04f-f00f-48da-802e-a588f8ac0898") }
    already_on_server = dict(crud.get_uploaded_files(db))

    upload_status = FileStatusesOut()

    for f in files:

        tmp_path = f"/tmp/{f.filename}"

        with open(tmp_path, "wb+") as file_object:

            # Copy uploaded wav file to tmp folder and generate md5 hash of original wav file
            shutil.copyfileobj(f.file, file_object)
            wav_hash = generate_file_md5(tmp_path)

            if(wav_hash in already_on_server.keys()):

                # Skip audio processing if file already exists according to md5 hash of original wav file
                upload_status.skipped.append(
                    FileStatus(
                        file_uuid = str(already_on_server[wav_hash]),
                        upload_filename = f.filename,
                        message = f"File already on server (md5: {wav_hash})"
                    )
                )

            else:

                # Insert file upload record into database (issues an identifier for the file)
                new_file = FileStatus(
                    file_uuid = crud.create_file(db, wav_hash, f.filename),
                    upload_filename = f.filename
                )

                # Generate downsampled and compressed audio files and upload to S3 buckets
                wav16k_path, mp3_path = wav_to_s3files(tmp_path, new_file.file_uuid)
                request.app.state.s3client.fput_object("audio-wav", os.path.basename(wav16k_path), wav16k_path)
                request.app.state.s3client.fput_object("audio-mp3", os.path.basename(mp3_path), mp3_path)

                upload_status.processed.append(new_file)

    return upload_status
