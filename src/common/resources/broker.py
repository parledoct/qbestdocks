from os import getenv

def get_broker_url() -> str:
    return "amqp://{user}:{pwd}@{hostname}:{port}".format(
        hostname=getenv("RABBITMQ_HOST", "127.0.0.1"),
        user=getenv("RABBITMQ_USER", "guest"),
        pwd=getenv("RABBITMQ_PASS", "guest"),
        port=getenv("RABBITMQ_PORT", "5672")
    )
