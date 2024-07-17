FROM python

WORKDIR /usr/src/app
COPY backend/requirements.txt ./backend/
RUN pip install -r backend/requirements.txt
COPY . .
WORKDIR /usr/src/app/backend

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
