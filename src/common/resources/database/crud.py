import datetime
from uuid import uuid4, UUID
from sqlalchemy.orm import Session

from .models import File, Annotation, TestRegion

#region Operations on files table
def file_exists(db: Session, file_uuid: UUID):
    return db.query(File.file_uuid).filter_by(file_uuid=file_uuid).first() is not None

def get_uploaded_files(db: Session):
    return db.query(File).with_entities(File.file_md5hash, File.file_uuid).all()

def create_file(db: Session, file_md5hash: str, upload_filename: str):
    new_file = File(
        file_uuid = uuid4(),
        file_md5hash = file_md5hash,
        upload_utctime = datetime.datetime.utcnow().isoformat(),
        upload_filename = upload_filename
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return new_file.file_uuid

#endregion

#region Operations on annotations table
def annotation_exists(db: Session, annot_uuid: str):
    return db.query(Annotation.annot_uuid).filter_by(annot_uuid=annot_uuid).first() is not None

def get_annotation(db: Session, annot_uuid: UUID = None):
    return db.query(Annotation).filter_by(annot_uuid=annot_uuid).first()

def get_file_annotations(db: Session, file_uuid: UUID = None):
    return db.query(Annotation).filter_by(file_uuid=file_uuid).all()

def create_annotation(db: Session, file_uuid: UUID, start_sec: float, end_sec: float, annotation: str):
    new_annotation = Annotation(
        annot_uuid = uuid4(),
        start_sec  = start_sec,
        end_sec    = end_sec,
        annotation = annotation,
        file_uuid  = file_uuid
    )

    db.add(new_annotation)
    db.commit()
    db.refresh(new_annotation)

    return new_annotation

def update_annotation(db: Session, annot_uuid: UUID, start_sec: float, end_sec: float, annotation: str):

    updated_annotation = db.query(Annotation).filter_by(annot_uuid=annot_uuid).update({
        "start_sec": start_sec,
        "end_sec": end_sec,
        "annotation": annotation
    }, synchronize_session = False)

    db.commit()

    return None

def delete_annotation(db: Session, annot_uuid: UUID):

    db.query(Annotation).filter_by(annot_uuid=annot_uuid).delete()
    db.commit()

    return None

#endregion
