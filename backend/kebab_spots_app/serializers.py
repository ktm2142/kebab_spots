from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import KebabSpot, KebabSpotRating, KebabSpotPhoto, KebabSpotComplaint


class KebabSpotPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = KebabSpotPhoto
        fields = ['id', 'photo', 'created_at']
        read_only_fields = ['id', 'created_at']


class KebabSpotComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = KebabSpotComplaint
        fields = ['id', 'user', 'spot', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at', 'user', 'spot']


class KebabSpotListSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = KebabSpot
        geo_field = 'coordinates'
        fields = ['id', 'coordinates', 'name', 'average_rating', 'ratings_count']


class KebabSpotDetailSerializer(GeoFeatureModelSerializer):
    photos = KebabSpotPhotoSerializer(many=True, read_only=True)

    # we tell DRF that this field will be calculated using the get_user_rating method
    user_rating = serializers.SerializerMethodField()

    # obj is the specific KebabSpot location for which we are currently generating JSON
    def get_user_rating(self, obj):
        # self.context is a dictionary that DRF automatically passes to the serializer, from where we get the request
        request = self.context.get('request')
        # check if the request exists and if the user is logged in
        if request and request.user.is_authenticated:
            """
            search the database for a rating where spot is our point and user is current user,
            .first() takes the first result or None if user didn't rated point yet
            """
            rating = KebabSpotRating.objects.filter(spot=obj, user=request.user).first()
            # if rating is found, return its value (1-5); if not, return None
            return rating.value if rating else None
        # if the user is not logged in, return None
        return None

    class Meta:
        model = KebabSpot
        geo_field = 'coordinates'
        fields = ['id', 'coordinates', 'user', 'name', 'description', 'photos', 'created_at', 'updated_at',
                  'average_rating', 'ratings_count', 'user_rating', 'private_territory', 'shop_nearby', 'gazebos',
                  'near_water', 'fishing', 'trash_cans', 'tables', 'benches', 'fire_pit', 'toilet',
                  'car_access']
        read_only_fields = ['user', 'created_at', 'updated_at', 'average_rating', 'ratings_count',
                            'user_rating']
