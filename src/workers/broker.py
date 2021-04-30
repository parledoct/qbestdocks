from os import getenv

def get_rabbitmq_userpass() -> str:
    RABBITMQ_USER = getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASS = getenv("RABBITMQ_PASS", "guest")
    return RABBITMQ_USER + ":" + RABBITMQ_PASS + "@" if RABBITMQ_USER else ""


def get_rabbitmq_port() -> str:
    RABBITMQ_PORT = getenv("RABBITMQ_PORT", "5672")
    return ":" + RABBITMQ_PORT if RABBITMQ_PORT else ""


def get_rabbitmq_vhost() -> str:
    RABBITMQ_VHOST = getenv("RABBITMQ_VHOST", "")
    return "/" + RABBITMQ_VHOST if RABBITMQ_VHOST else ""


def get_rabbitmq_host() -> str:
    return getenv("RABBITMQ_HOST", "127.0.0.1")


def get_broker_url() -> str:
    return "amqp://{userpass}{hostname}{port}{vhost}".format(
        hostname=get_rabbitmq_host(),
        userpass=get_rabbitmq_userpass(),
        port=get_rabbitmq_port(),
        vhost=get_rabbitmq_vhost()
    )
