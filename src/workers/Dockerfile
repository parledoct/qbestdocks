FROM python:3.7-slim-buster

COPY requirements.txt /workers/requirements.txt

WORKDIR /workers

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
	apt-get install -y ffmpeg \
    libpq-dev \
    gcc

RUN apt-get update -yqq && \
    apt-get -yqq install libsndfile1 --no-install-recommends && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --compile -r requirements.txt && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/* /tmp/* /var/tmp/*

COPY . /workers

EXPOSE 6379 5672
