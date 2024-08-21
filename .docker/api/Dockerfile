FROM python

RUN apt-get update && apt-get install -y gettext openssl

WORKDIR /usr/src/app
COPY backend/requirements.txt ./backend/
RUN pip install --upgrade pip && pip install -r backend/requirements.txt
COPY . .
WORKDIR /usr/src/app/backend

EXPOSE 8000

RUN chmod +x ../.docker/api/entrypoint.sh

ENTRYPOINT [ "bash", "../.docker/api/entrypoint.sh" ]
