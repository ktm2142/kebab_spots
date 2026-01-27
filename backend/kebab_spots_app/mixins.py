from PIL import Image
from rest_framework.exceptions import ValidationError
from .models import KebabSpotPhoto

class CheckPhotosMixin:
    MAX_PHOTOS = 10
    MAX_SIZE = 5 * 1024 * 1024
    ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    PHOTOS_FIELD = 'photos'

    # self.request is provided by DRF views
    def get_photos(self):
        return self.request.FILES.getlist(self.PHOTOS_FIELD)

    def validate_photos(self, photos):
        if len(photos) > self.MAX_PHOTOS:
            raise ValidationError({'Photos': 'Maximum photos for upload is 10'})
        for photo in photos:
            self.validate_type_size(photo)

    def validate_type_size(self, photo):
        if photo.size > self.MAX_SIZE:
            raise ValidationError({'Photos': f'Photo {photo.name} is too large. Must be not bigger that 5 mb'})
        if photo.content_type not in self.ALLOWED_TYPES:
            raise ValidationError({'Photos': f'Photo {photo.name} has wrong format. Only JPEG, JPG, PNG, '
                                             f'WEBP are allowed'})
        try:
            img = Image.open(photo)
            img.verify()  # Fast check for corrupted image
            photo.seek(0)  # Going to the beginning of the file in bytes (0 - first byte)
        except:
            raise ValidationError({'Photos': f'File {photo.name} is not a valid image or corrupted.'})

    def save_photos(self, spot, photos):
        for photo in photos:
            KebabSpotPhoto.objects.create(
                spot=spot,
                user=self.request.user,
                photo=photo
            )


class FiltersMixin:
    AMENITIES = [
        'private_territory', 'shop_nearby', 'gazebos', 'near_water',
        'fishing', 'trash_cans', 'tables', 'benches', 'fire_pit', 'toilet',
        'car_access'
    ]

    def apply_filters(self, queryset):
        # self.request is provided by DRF views
        params = self.request.query_params
        for amenity in self.AMENITIES:
            if params.get(amenity):
                queryset = queryset.filter(**{amenity: True})

        min_rating = params.get('min_rating')
        if min_rating:
            try:
                queryset = queryset.filter(average_rating__gte=float(min_rating))
            except (ValueError, TypeError):
                pass
        return queryset
