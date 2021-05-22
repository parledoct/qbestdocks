import datetime
from typing import List
from uuid import uuid4, UUID
from sqlalchemy.orm import Session

from .models import File, Annotation, TestRegion, SearchJob, SearchResult

def create_views(db: Session):
    """
    The table search_jobs stores the queries and files selected for a search job
    as a PostgreSQL array column, e.g.:

    | search_uuid | annot_uuids | file_uuids |
    |      1      |   [1,2,3]   |   [5,6,7]  |

    These views make it easy to access the annot_uuid or file_uuid as rows, e.g.:
    | search_uuid | annot_uuid |
    |      1      |      1     |
    |      1      |      2     |
    |      1      |      3     |
    """

    db.execute("""\
        CREATE OR REPLACE VIEW search_tests AS
            SELECT
                s.search_uuid,
                s.file_uuid,
                t.test_uuid,
                t.start_sec,
                t.end_sec
            FROM
		        (SELECT *, unnest(file_uuids) AS file_uuid FROM search_jobs) s
            LEFT JOIN test_regions t
            ON s.file_uuid = t.file_uuid
    """)

    db.execute("""\
        CREATE OR REPLACE VIEW search_annots AS
        SELECT
            s.search_uuid,
            a.file_uuid,
            s.annot_uuid,
            a.start_sec,
            a.end_sec
        FROM
		    (SELECT *, unnest(annot_uuids) AS annot_uuid FROM search_jobs) s
        LEFT JOIN annotations a
        ON s.annot_uuid = a.annot_uuid
    """)

    db.commit()

#region Operations on files table
def get_files(db: Session):
    return db.query(File).all()

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
def get_annotations(db: Session):
    return db.query(Annotation).all()

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

#region Operations on test_regions table
def get_unregioned_files(db: Session, search_uuid: str):
    # Get list of files for which audio activity regions have not yet been derived
    # i.e. files with no corresponding test_ids in the test_regions table
    results = db.execute(f"""\
        SELECT DISTINCT file_uuid FROM search_tests WHERE
            test_uuid is NULL AND search_uuid = '{search_uuid}'
    """).fetchall()

    results = [ str(dict(row)['file_uuid']) for row in results ] if results is not None else [ ]

    return results

def test_regions_exists(db: Session, file_uuid: UUID):
    return db.query(TestRegion.file_uuid).filter_by(file_uuid=file_uuid).first() is not None

def get_test_regions(db: Session, file_uuid: UUID):
    return db.query(TestRegion.file_uuid).filter_by(file_uuid=file_uuid).with_entities(TestRegion.test_uuid).all()

def create_test_region(db: Session, file_uuid: UUID, start_sec: float, end_sec: float):
    new_region = TestRegion(
        test_uuid = uuid4(),
        start_sec  = start_sec,
        end_sec    = end_sec,
        file_uuid  = file_uuid
    )

    db.add(new_region)
    db.commit()
    db.refresh(new_region)

    return new_region.test_uuid
#endregion

#region Operations on search_jobs table
def get_search_jobs(db: Session):
    return db.query(SearchJob).all()

def get_search_job(db: Session, search_uuid: UUID):
    return db.query(SearchJob).filter_by(search_uuid=search_uuid).first()

def create_search_job(db: Session, annot_uuids: List[UUID], file_uuids: List[UUID]):
    new_job = SearchJob(
        search_uuid = uuid4(),
        annot_uuids = annot_uuids,
        file_uuids  = file_uuids
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job.search_uuid

def create_search_result(db: Session, annot_uuid: UUID, test_uuid: UUID, sim_score: float, match_start: float, match_end: float):
    new_result = SearchResult(
        result_uuid = uuid4(),
        result_flag = None,
        annot_uuid  = annot_uuid,
        test_uuid   = test_uuid,
        # Use item() to convert NumPy float64
        # to native Python values
        score       = sim_score.item(),
        start_prop  = match_start.item(),
        end_prop    = match_end.item()
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

#endregion

#region Other (i.e. more complex) queries

def get_all_segments(db: Session, search_uuid: str):
    # Get all 'segments' (both annotations and test regions), the start and end times and associated files
    # Returns table of segments:
    # | segment_uuid (annot_uuid or test_uuid) | file_uuid | start_sec | end_sec |

    results = db.execute(f"""\
        SELECT annot_uuid AS segment_uuid, file_uuid, start_sec, end_sec
            FROM search_annots WHERE search_uuid = '{search_uuid}'
        UNION
            SELECT test_uuid AS segment_uuid, file_uuid, start_sec, end_sec
                FROM search_tests WHERE search_uuid = '{search_uuid}' AND test_uuid IS NOT NULL
    """).fetchall()

    return results

def get_unsearched_pairs(db: Session, search_uuid: str):
    """
    Gets all pairs of queries (from annotations table) and test items (from test regions table) that are
    a) part of the current search set and b) have not already had been compared in a previous search
    (i.e. has a result_uuid in the search_results table)
    """

    results = db.execute(f"""\
        SELECT c.annot_uuid, c.test_uuid FROM (
            (SELECT annot_uuid FROM search_annots WHERE search_uuid = '{search_uuid}') a
            CROSS JOIN
            (SELECT test_uuid FROM search_tests WHERE search_uuid = '{search_uuid}') t
        ) c
        LEFT JOIN
            search_results r ON c.annot_uuid = r.annot_uuid AND c.test_uuid = r.test_uuid
        WHERE r.result_uuid IS NULL
    """).fetchall()

    return results

def get_search_results(db: Session, annot_uuid: UUID = None, file_uuid: UUID = None):

    annot_uuid = 'NULL' if annot_uuid is None else f"'{annot_uuid}'"
    file_uuid  = 'NULL' if file_uuid is None else f"'{file_uuid}'"

    results = db.execute(f"""\
        SELECT r.result_uuid,
            r.annot_uuid,
            a.annotation,
            r.test_uuid,
            t.file_uuid AS file_uuid,
            t.start_sec AS test_start_sec,
            t.end_sec AS test_end_sec,
            start_prop * (t.end_sec-t.start_sec) AS match_start_sec,
            end_prop * (t.end_sec-t.start_sec) AS match_end_sec,
            r.score AS match_score
        FROM search_results r
        LEFT JOIN
            test_regions t ON t.test_uuid = r.test_uuid
        LEFT JOIN
            annotations a ON a.annot_uuid = r.annot_uuid
        WHERE
            t.file_uuid = {file_uuid}
        %s
            r.annot_uuid = {annot_uuid}
    """ % ('AND' if annot_uuid is not None and file_uuid is not None else 'OR')).fetchall()

    return results

#endregion
