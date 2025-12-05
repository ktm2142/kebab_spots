from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import KebabSpot


class KebabSpotSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = KebabSpot
        geo_field = 'location'
        fields = ['id', 'location', 'name', 'description', 'rating', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at']