from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework.serializers import ModelSerializer
from .models import KebabSpot, KebabSpotRating


# class KebabSpotRatingSerializer(ModelSerializer):
#     class Meta:
#         model = KebabSpotRating
#         fields = ['spot', 'user', 'value']


class KebabSpotSerializer(GeoFeatureModelSerializer):
    # rating = KebabSpotRatingSerializer(read_only=True)

    class Meta:
        model = KebabSpot
        geo_field = 'coordinates'
        fields = ['id', 'coordinates', 'user', 'name', 'description', 'created_at', 'updated_at',
                  'average_rating', 'ratings_count', 'private_territory', 'shop_nearby', 'gazebos',
                  'near_water', 'fishing', 'trash_cans', 'tables', 'benches', 'fire_pit', 'toilet',
                  'car_access']
        read_only_fields = ['user', 'created_at', 'updated_at', 'average_rating', 'ratings_count']



