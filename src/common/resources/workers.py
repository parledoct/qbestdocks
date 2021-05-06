from os import getenv
from celery import Celery 
from .database.conn import SQLALCHEMY_DATABASE_URL

RABBITMQ_BROKER_URL = "amqp://{user}:{pwd}@{hostname}:{port}".format(
        hostname=getenv("RABBITMQ_HOST", "127.0.0.1"),
        user=getenv("RABBITMQ_USER", "guest"),
        pwd=getenv("RABBITMQ_PASS", "guest"),
        port=getenv("RABBITMQ_PORT", "5672")
    )

def get_celery_workers():
    workers = Celery("audio", broker=RABBITMQ_BROKER_URL, backend="db+" + SQLALCHEMY_DATABASE_URL)
    workers.conf.update(task_track_started=True)

    return workers
