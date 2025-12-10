from django.db import models
from django.contrib.gis.db import models as gis_models
from config_app.settings import AUTH_USER_MODEL


class KebabSpot(models.Model):
    coordinates = gis_models.PointField(geography=True)
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spots')
    name = models.CharField(max_length=30)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
