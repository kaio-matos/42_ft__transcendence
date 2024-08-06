#!/bin/bash

# Create translation files
echo "Creating Tranlation Files"
python manage.py makemessages --all

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

# Start server
echo "Starting server"
python manage.py runserver 0.0.0.0:8000
