Create the migration code with the new changes to the models
```bash
docker compose exec api python manage.py makemigrations pong
```

Migrate the database
```bash
docker compose exec api python manage.py migrate
```

Interact with the application
```bash
docker compose exec api python manage.py shell
```
