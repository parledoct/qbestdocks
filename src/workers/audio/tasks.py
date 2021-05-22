import auditok, os, psycopg2

import librosa
import numpy as np
from pydub import AudioSegment
from uuid import UUID

from dtw import dtw, StepPattern
from scipy.spatial.distance import cdist

from celery import Celery
from celery.utils.log import get_task_logger

from sqlalchemy.orm import Session
from common.resources.database import conn
import common.resources.database.crud as crud

from common.resources.s3 import get_s3_client
from common.resources.workers import get_celery_workers

audio  = get_celery_workers()
logger = get_task_logger(__name__)

s3     = get_s3_client()
db     = conn.SessionLocal()

@audio.task
def check_test_regions(search_uuid: str):
    """
    Check whether non-silence regions have been derived for a given file.
    If no such regions exist, then derive them and insert the corresponding
    time spans into the test_regions table.
    """

    unregioned_files = crud.get_unregioned_files(db, search_uuid)

    for file_uuid in unregioned_files:

        tmp_path = f"/tmp/{file_uuid}.wav"

        # Fetch file from s3 bucket if not already in /tmp folder
        if not os.path.isfile(tmp_path):
            s3.fget_object("audio-wav", f"{file_uuid}.wav", tmp_path)

        test_regions = auditok.split(tmp_path, energy_threshold=40)

        for r in test_regions:
            crud.create_test_region(db, UUID(file_uuid), round(r.meta.start, 3), round(r.meta.end, 3))

    if len(unregioned_files) == 0:
        logger.info("Audio activitiy regions already derived for all test file(s).")

    else:
        derived_regions = ", ".join(unregioned_files)
        logger.info(f"Audio activitiy regions derived for test file(s): {derived_regions}")

    # Pass search_uuid to next task in chain
    return search_uuid

@audio.task
def check_feature_files(search_uuid: str):
    """
    Check whether features have been extracted for a given identifier (query or test item).
    If features exist in bucket but not locally in /tmp, fetch features file from s3 bucket.
    If features don't exist, derive them and upload to s3 (keeping a copy in /tmp for downstream search).
    """

    # Get list of files (i.e. IDs) without npy extension
    npy_ids  = [ os.path.splitext(o.object_name)[0] for o in s3.list_objects('features-npy') ]

    # Get all 'segments' (both annotations and test regions), the start and end times and associated files
    # Returns table of segments:
    # | segment_uuid (annot_uuid or test_uuid) | file_uuid | start_sec | end_sec |
    segments  = crud.get_all_segments(db, search_uuid)

    extracted = []

    for segment_uuid, file_uuid, start_sec, end_sec in segments:

        npy_path = f"/tmp/{segment_uuid}.npy"

        if str(segment_uuid) in npy_ids:
            # If features already extracted for segment, fetch from s3 bucket
            # if the file isn't already in tmp from another search job

            if not os.path.isfile(npy_path):
                s3.fget_object("features-npy", f"{segment_uuid}.npy", npy_path)

        else:
            # If features don't exist, extract them from corresponding region of wav file

            # Fetch wav file if not already in tmp
            wav_path = f"/tmp/{file_uuid}.wav"

            if not os.path.isfile(wav_path):
                s3.fget_object("audio-wav", f"{file_uuid}.wav", wav_path)

            # From wav file, get region of interest using pydub.AudioSegment to get samples given range in seconds
            # From: https://github.com/jiaaro/pydub/blob/master/API.markdown#audiosegmentget_array_of_samples
            wav_dat = AudioSegment.from_wav(wav_path)
            roi_dat = wav_dat[start_sec * 1000:end_sec * 1000]
            roi_dat = np.array(roi_dat.get_array_of_samples()).T.astype(np.float32)

            # Use Librosa MFCC features for dev work for now (replace with wav2vec 2.0 later)
            features = librosa.feature.mfcc(roi_dat, sr=16000).T

            # Save features and upload to s3
            np.save(npy_path, features)
            s3.fput_object("features-npy", os.path.basename(npy_path), npy_path)

            extracted.append(str(segment_uuid))

    if len(extracted) == 0:
        logger.info("Features already extracted for all segments.")

    else:
        extracted_items = ", ".join(extracted)
        logger.info(f"Features extracted for segments: {extracted_items}")

    # Pass search_uuid to next task in chain
    return search_uuid

@audio.task
def run_qbestd_search(search_uuid: str, window_step = 4):

    search_pairs = crud.get_unsearched_pairs(db, search_uuid)

    if search_pairs is None:
        logger.info("Searches for all query and test items pairs in search job already previously completed!")
        return None

    n_pairs = len(search_pairs) + 1

    for p, pair in enumerate(search_pairs):
        annot_uuid, test_uuid = pair

        query_feats = np.load(f"/tmp/{annot_uuid}.npy")
        test_feats  = np.load(f"/tmp/{test_uuid}.npy")

        distance_matrix = cdist(query_feats, test_feats, 'seuclidean', V = None)
        distance_matrix = (distance_matrix - distance_matrix.min(0)) / distance_matrix.ptp(0)

        segdtw_dists = []
        segdtw_mlens = [] # Lengths of matches

        query_length, test_length = distance_matrix.shape

        # reject if alignment less than half of query size
        # or if larger than 1.5 times query size
        min_match_ratio, max_match_ratio = [0.5, 1.5]

        window_size      = int(query_length * max_match_ratio)
        last_segment_end = int(test_length - (min_match_ratio * query_length))

        for r_i in range(0, last_segment_end, window_step):

            segment_start = r_i
            segment_end   = min(r_i + window_size, test_length)

            segment_data  = distance_matrix[:,segment_start:segment_end]

            dtw_obj = dtw(segment_data,
                step_pattern = "symmetricP1", # See Sakoe & Chiba (1978) for definition of step pattern
                open_end = True,              # Let alignment end anywhere along the segment (need not be at lower corner)
                distance_only = True          # Speed up dtw(), no backtracing for alignment path
            )

            match_ratio = dtw_obj.jmin / query_length

            if match_ratio < min_match_ratio or match_ratio > max_match_ratio:
                segdtw_dists.append(1)
            else:
                segdtw_dists.append(dtw_obj.normalizedDistance)

            segdtw_mlens.append(dtw_obj.jmin)

        # Convert distance (lower is better) to similary score (is higher better)
        # makes it easier to compare with CNN output probabilities
        #
        # Return 0 if segdtw_dists is [] (i.e. no good alignments found)
        sim_score = np.int64(0) if len(segdtw_dists) == 0 else 1 - min(segdtw_dists)

        min_index = np.argmin(segdtw_dists) if len(segdtw_dists) > 0 else np.int64(0)
        match_len = segdtw_mlens[min_index] if len(segdtw_dists) > 0 else np.float64(0)

        # Convert matched region to proportion of test length
        # e.g. match portion from 10% - 15% of time span
        match_start = min_index / test_length
        match_end   = (match_start + match_len) / test_length

        crud.create_search_result(db, annot_uuid, test_uuid, sim_score, match_start, match_end)

        logger.info(f"Search task: {round((p + 1)/n_pairs*100, 2)}% complete")
