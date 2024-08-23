#!/bin/bash

# Create logs directory
mkdir -p logs

# Generate SSL certificate
openssl req -x509 -newkey rsa:4096 \
    -keyout ./certs/localhost.key -out ./certs/localhost.crt \
    -days 365 -nodes -subj "/C=BR/ST=SP/L=São Paulo/O=42/OU=42/CN=transcendence.42.fr/UID=transcendence"

# Create translation files
echo "Creating Tranlation Files"
python manage.py makemessages --all

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

# Start gunicorn
# echo "Starting gunicorn server"
# gunicorn -c gunicorn_config.py --reload

# Start server
echo "Starting server"
python manage.py runserver 0.0.0.0:8000
