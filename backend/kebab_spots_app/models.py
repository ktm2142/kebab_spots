from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.gis.db import models as gis_models
from config_app.settings import AUTH_USER_MODEL
from django.db.models import Avg, Count


class KebabSpot(models.Model):
    # Geometry
    coordinates = gis_models.PointField(geography=True)

    # Author
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spots')

    # Info
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    hidden = models.BooleanField(default=False)

    # Rating data
    average_rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    ratings_count = models.PositiveIntegerField(default=0)

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

    def update_rating(self):
        """
        We recalculate the average rating based on all ratings for this point.
        This method is called every time someone adds or changes rating.
        """
        aggregated = self.ratings.aggregate(
            avg=Avg('value'),
            count=Count('id')
        )
        # If there is no rating, avg will be None.
        self.average_rating = aggregated['avg'] or 0.0
        self.ratings_count = aggregated['count']
        self.save(update_fields=['average_rating', 'ratings_count'])

    def __str__(self):
        return self.name


class KebabSpotRating(models.Model):
    spot = models.ForeignKey(KebabSpot, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    value = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('spot', 'user')

    def __str__(self):
        return f'{self.user.username} rated {self.spot.name} with {self.value} rating'


class KebabSpotPhoto(models.Model):
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    spot = models.ForeignKey(KebabSpot, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='kebab_spots/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Photo of spot ID: {self.spot.name} by {self.user.username}'


class KebabSpotComplaint(models.Model):
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.CASCADE)
    spot = models.ForeignKey(KebabSpot, on_delete=models.CASCADE, related_name='complaints')
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('spot', 'user')

    def __str__(self):
        return f'Complaint of {self.user.username} on {self.spot.name}'
