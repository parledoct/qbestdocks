import datetime
from uuid import uuid4, UUID
from sqlalchemy.orm import Session

from . import models
from core.schemas.audio import FileStatus
from core.schemas.annotations import AnnotationOut

#region Operations on files table
def file_exists(db: Session, file_uuid: UUID):
    return db.query(models.File.file_uuid).filter_by(file_uuid=file_uuid).first() is not None

def create_file(db: Session, file_md5hash: str, upload_filename: str):
    new_file = models.File(
        file_uuid = uuid4(),
        file_md5hash = file_md5hash,
        upload_utctime = datetime.datetime.utcnow().isoformat(),
        upload_filename = upload_filename
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return FileStatus(file_id = new_file.file_uuid, upload_filename = upload_filename)

#endregion

#region Operations on annotations table
def annotation_exists(db: Session, annot_uuid: str):
    return db.query(models.Annotation.annot_uuid).filter_by(annot_uuid=annot_uuid).first() is not None

def get_annotation(db: Session, file_uuid: UUID = None, annot_uuid: UUID = None):

    assert file_uuid is not None or annot_uuid is not None

    if file_uuid is not None:
        annotations =  db.query(models.Annotation).filter_by(file_uuid=file_uuid).all()
    elif annot_uuid is not None:
        annotations =  [ db.query(models.Annotation).filter_by(annot_uuid=annot_uuid).first() ]

    return [
        AnnotationOut(
            id=a.annot_uuid, start_sec=a.start_sec, end_sec=a.end_sec, annotation=a.annotation
        ) for a in annotations
    ]

def create_annotation(db: Session, file_uuid: UUID, start_sec: float, end_sec: float, annotation: str):
    new_annotation = models.Annotation(
        annot_uuid = uuid4(),
        start_sec  = start_sec,
        end_sec    = end_sec,
        annotation = annotation,
        file_uuid  = file_uuid
    )

    db.add(new_annotation)
    db.commit()
    db.refresh(new_annotation)

    return AnnotationOut(
        id = new_annotation.annot_uuid,
        start_sec  = start_sec,
        end_sec    = end_sec,
        annotation = annotation
    )

def update_annotation(db: Session, annot_uuid: UUID, start_sec: float, end_sec: float, annotation: str):

    db.query(models.Annotation).filter_by(annot_uuid=annot_uuid).update({
        "start_sec": start_sec,
        "end_sec": end_sec,
        "annotation": annotation
    }, synchronize_session = False)

    db.commit()

    return AnnotationOut(
        id = annot_uuid,
        start_sec  = start_sec,
        end_sec    = end_sec,
        annotation = annotation
    )

def delete_annotation(db: Session, annot_uuid: UUID):

    db.query(models.Annotation).filter_by(annot_uuid=annot_uuid).delete()
    db.commit()

    return AnnotationOut(
        id = annot_uuid,
        start_sec  = -1,
        end_sec    = -1,
        annotation = "(annotation deleted)"
    )
