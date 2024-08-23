# backend/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Definir o módulo de configuração do Django para o Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Carregar configurações do Celery do settings.py
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descobrir automaticamente as tasks definidas em apps instalados no Django
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
