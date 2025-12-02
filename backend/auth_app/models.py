from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    country = models.CharField(max_length=50, null=True, blank=True)
    city = models.CharField(max_length=150, null=True, blank=True)
