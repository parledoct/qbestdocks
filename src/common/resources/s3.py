from os import getenv
from minio import Minio

def get_s3_client():
    endpoint = "{host}:{port}".format(
            host = getenv("MINIO_HOST", "127.0.0.1"),
            port = getenv("MINIO_PORT", "9000")
        )
    access_key = getenv("MINIO_ACCESS_KEY", "minioadmin")
    secret_key = getenv("MINIO_SECRET_KEY", "minioadmin")

    return Minio(
        endpoint,
        access_key,
        secret_key,
        secure = False
    )
