import uuid
import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, UnicodeText
from sqlalchemy.dialects.postgresql import UUID

from .conn import Base

class File(Base):
    __tablename__ = "files"

    file_uuid       = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    file_md5hash    = Column(String(32), unique=True)
    upload_utctime  = Column(DateTime, default=datetime.datetime.utcnow)
    upload_filename = Column(UnicodeText)

class Annotation(Base):
    __tablename__ = "annotations"

    annot_uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    start_sec  = Column(Float)
    end_sec    = Column(Float)
    annotation = Column(UnicodeText)
    file_uuid  = Column(UUID(as_uuid=True), ForeignKey('files.file_uuid'), nullable=False)

class TestRegion(Base):
    __tablename__ = "test_regions"

    test_uuid  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    start_sec  = Column(Float)
    end_sec    = Column(Float)
    file_uuid  = Column(UUID(as_uuid=True), ForeignKey('files.file_uuid'), nullable=False)
