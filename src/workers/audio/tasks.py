import auditok, os, psycopg2, uuid

import librosa
import numpy as np
from pydub import AudioSegment

from celery import Celery 
from time import sleep

import common.resources.database
import common.resources.crud
from common.resources.s3 import get_s3_client
from common.resources.broker import get_broker_url

audio = Celery("audio", broker=get_broker_url())
s3    = get_s3_client()

@audio.task
def check_test_regions(file_id):
    """
    Check whether non-silence regions have been derived for a given file.
    If no such regions exist, then derive them and insert the corresponding
    time spans into the test_regions table.
    """

    cur = db.cursor()
    cur.execute("SELECT count(1) > 0 FROM test_regions WHERE file_id = %s", (file_id, ))
    regions_exist = cur.fetchone()[0]
    cur.close()

    if regions_exist is not True:
        tmp_path = f"/tmp/{file_id}.wav"

        if not os.path.isfile(tmp_path):
            s3.fget_object("audio-wav", f"{file_id}.wav", tmp_path)

        test_regions = auditok.split(tmp_path, energy_threshold=40)

        for r in test_regions:

            new_test_id = str(uuid.uuid1())

            cur = db.cursor()
            
            with db:
                cur.execute(
                    "INSERT INTO test_regions (file_id, test_id, start_sec, end_sec) VALUES (%s, %s, %s, %s)",
                    (file_id, new_test_id, r.meta.start, r.meta.end)
                )

            cur.close()

@audio.task
def check_feature_file(id, id_type):
    """
    Check whether features have been extracted for a given identifier (query or test item).
    If features don't exist on the s3 'features-npy' bucket, then extract them and upload
    to s3 (also keeping a local copy in '/tmp' for the downstream search task).
    """

    try:
        # Try to get metadata of features file from s3 server
        # set npy_exists to False if exception is raied (i.e. file doesn't exist)
        s3.stat_object("features-npy", f"{id}.npy")
        npy_exists = True
    except:
        npy_exists = False

    if npy_exists is not True:

        cur = db.cursor()

        if id_type == "annotation":
            cur.execute("SELECT file_id, start_sec, end_sec FROM annotations WHERE annotation_id = %s LIMIT 1", (id, ))
        else:
            cur.execute("SELECT file_id, start_sec, end_sec FROM test_regions WHERE test_id = %s LIMIT 1", (id, ))

        file_id, start_sec, end_sec = cur.fetchone()
        cur.close()

        wav_path = f"/tmp/{file_id}.wav"

        if not os.path.isfile(file_id):
            s3.fget_object("audio-wav", f"{file_id}.wav", wav_path)

        wav_dat = AudioSegment.from_wav(wav_path)

        # Subset region of interest
        roi_dat = wav_dat[start_sec * 1000:end_sec * 1000]

        # Convert AudioSegment to NumPy array of samples
        # From: https://github.com/jiaaro/pydub/blob/master/API.markdown#audiosegmentget_array_of_samples
        roi_dat = np.array(roi_dat.get_array_of_samples()).T.astype(np.float32)

        # Use Librosa MFCC features for dev work for now (replace with wav2vec 2.0 later)
        features = librosa.feature.mfcc(roi_dat, sr=16000).T

        npy_path = f"/tmp/{id}.npy"

        np.save(npy_path, features)

