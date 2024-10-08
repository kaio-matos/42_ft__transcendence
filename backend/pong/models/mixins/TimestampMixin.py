from django.db import models


class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    ##################################################
    # Queries
    ##################################################

    ##################################################
    # Computed
    ##################################################

    ##################################################
    # Notification
    ##################################################

    ##################################################
    # Logic
    ##################################################

    ##################################################
    # Resource
    ##################################################

    class Meta:
        abstract = True
