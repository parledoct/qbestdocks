from os import getenv
from minio import Minio

class MS3:
    def __init__(self):
        self.endpoint = "{host}:{port}".format(
                host = getenv("MINIO_HOST", "127.0.0.1"),
                port = getenv("MINIO_PORT", "9000")
            )
        self.access_key = getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = getenv("MINIO_SECRET_KEY", "minioadmin")

        self.client = Minio(
            self.endpoint,
            self.access_key,
            self.secret_key,
            secure = False
        )

        # Make buckets if they don't exist.
        [ self.client.make_bucket(b) for b in ["audio-wav", "audio-mp3", "features-npy"] if not self.client.bucket_exists(b) ]
