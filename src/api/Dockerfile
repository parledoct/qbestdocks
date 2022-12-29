FROM python:3.7-slim-buster

COPY requirements.txt /api/requirements.txt

WORKDIR /api

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
    apt-get install -y ffmpeg \
    libpq-dev \
    gcc

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --compile -r requirements.txt && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/* /tmp/* /var/tmp/*

COPY . /api

EXPOSE 5000 6379 5672 9000

CMD uvicorn main:app_full --host 0.0.0.0 --port 5000 --reload
