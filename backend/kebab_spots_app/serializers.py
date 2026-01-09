from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import KebabSpot


class KebabSpotSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = KebabSpot
        geo_field = 'coordinates'
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
