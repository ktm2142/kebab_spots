from django.db import models
from django.contrib.gis.db import models as gis_models
from config_app.settings import AUTH_USER_MODEL


class KebabSpot(models.Model):
    # Geometry
    coordinates = gis_models.PointField(geography=True)

    # Author
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spots')

    # Info
    name = models.CharField(max_length=50)
    description = models.TextField()

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Rating
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)

    # Amenities
    private_territory = models.BooleanField(default=False)
    shop_nearby = models.BooleanField(default=False)
    gazebos = models.BooleanField(default=False)
    near_water = models.BooleanField(default=False)
    fishing = models.BooleanField(default=False)
    trash_cans = models.BooleanField(default=False)
    tables = models.BooleanField(default=False)
    benches = models.BooleanField(default=False)
    fire_pit = models.BooleanField(default=False)
    toilet = models.BooleanField(default=False)
    car_access = models.BooleanField(default=False)

    def __str__(self):
        return self.name
