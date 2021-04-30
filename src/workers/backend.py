from os import getenv

def get_redis_password() -> str:
    return getenv("REDIS_PASS", "password")


def get_redis_port() -> str:
    return getenv("REDIS_PORT", "6379")


def get_redis_dbnum() -> str:
    return getenv("REDIS_DB", "0")


def get_redis_host() -> str:
    return getenv("REDIS_HOST", "127.0.0.1")


def get_backend_url() -> str:
    pw = get_redis_password()
    port = get_redis_port()
    db = get_redis_dbnum()
    return "redis://{password}{hostname}{port}{db}".format(
        hostname=get_redis_host(),
        password=':' + pw + '@' if len(pw) != 0 else '',
        port=':' + port if len(port) != 0 else '',
        db='/' + db if len(db) != 0 else ''
    )