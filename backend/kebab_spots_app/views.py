import requests
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from .models import KebabSpot, KebabSpotRating, KebabSpotPhoto
from .serializers import KebabSpotListSerializer, KebabSpotDetailSerializer


def apply_filters(queryset, query_params):
    amenities = [
        'private_territory', 'shop_nearby', 'gazebos', 'near_water',
        'fishing', 'trash_cans', 'tables', 'benches', 'fire_pit', 'toilet',
        'car_access'
    ]
    for amenity in amenities:
        value = query_params.get(amenity)
        if value == 'true':
            queryset = queryset.filter(**{amenity: True})

    min_rating = query_params.get('min_rating')
    if min_rating:
        try:
            queryset = queryset.filter(average_rating__gte=float(min_rating))
        except (ValueError, TypeError):
            pass
    return queryset


class ListKebabSpotsAPIView(generics.ListAPIView):
    """
    Getting latitude, longitude and radius from query_params, and loading spots in given radius.
    If data in query_params is not valid we return basic queryset,
    and load all spots in standard radius which indicated in frontend.
    If coordinates are not given at all, we don't load ALL spots from DB.
    """
    serializer_class = KebabSpotListSerializer
    queryset = KebabSpot.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()

        lat = self.request.query_params.get('lat')
        lon = self.request.query_params.get('lon')
        radius = self.request.query_params.get('radius')

        if lat is None or lon is None:
            return KebabSpot.objects.none()

        try:
            lat = float(lat)
            lon = float(lon)
            radius = float(radius)
            if radius < 5 or radius > 30:
                raise ValidationError({'details': 'Radius must be between 5 and 30'})
        except (ValueError, TypeError):
            raise ValidationError({'details:' 'lat/lon/radius must be numbers'})

        center_point = Point(lon, lat, srid=4326)
        qs = qs.filter(coordinates__distance_lte=(center_point, D(km=float(radius))))
        qs = apply_filters(qs, self.request.query_params)
        # qs = qs.prefetch_related('photos')
        return qs


class SearchKebabSpotsAPIView(APIView):
    """
    Getting name of city/village and radius from frontend.
    Making search request to openstreetmap.

    """

    def get(self, request):
        location_name = self.request.query_params.get('location')
        radius = self.request.query_params.get('radius', 10)

        if not location_name:
            return Response(
                {'error': 'Enter location'},
                status=status.HTTP_400_BAD_REQUEST
            )

        nominatim_url = 'https://nominatim.openstreetmap.org/search'
        params = {
            'q': location_name,
            'format': 'json',
            'limit': 1
        }

        headers = {'User-Agent': 'KebabSpots/2.0 (ktm2142@gmail.com)'}

        try:
            response = requests.get(nominatim_url, params=params, headers=headers)
            response.raise_for_status()

            data = response.json()
            """
            .json() - belongs to the requests library
            .json() takes response.text, which looks like a string,
            and parses it into a Python object (list or dictionary)
            """

            if not data:
                return Response(
                    {'error': 'Location not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            """
            Response is a class from Django REST Framework that creates an HTTP response.
            inside it have HTTP status code, Headers, 
            text - raw text of the response (as a string),
            content - bytes (if it is a file or image).
            """

            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            center_point = Point(lon, lat, srid=4326)

            # getting points based on coordinates given from Nominatim
            nearby_spots = KebabSpot.objects.filter(
                coordinates__distance_lte=(center_point, D(km=float(radius)))
            )
            nearby_spots = apply_filters(nearby_spots, request.query_params)

            serializer = KebabSpotListSerializer(nearby_spots, many=True, context={'request': request})
            return Response({
                # coordinates and name of town we searched
                'location': {
                    'name': data[0].get('name'),
                    'lat': lat,
                    'lon': lon
                },
                # list of kebab spot objects
                'spots': serializer.data
            })

        except requests.RequestException:
            return Response(
                {'error': 'Failed to connect to OSM'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except (ValueError, KeyError):
            return Response(
                {'error': 'invalid data received from OSM'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreateKebabSpotAPIView(generics.CreateAPIView):
    serializer_class = KebabSpotDetailSerializer
    permission_classes = [IsAuthenticated]
    queryset = KebabSpot.objects.all()

    def perform_create(self, serializer):
        # creating the spot
        spot = serializer.save(user=self.request.user)

        # getting photos from request.FILES
        photos = self.request.FILES.getlist('photos')

        # checking amount of photos
        if len(photos) > 10:
            raise ValidationError({'Photos': 'Maximum photos for upload is 10'})

        # checking size of every photo
        max_size = 5 * 1024 * 1024

        # creating object of every photo.
        for photo in photos:
            if photo.size > max_size:
                raise ValidationError({'Photos': f'Photo {photo.name} is too large. Must be not bigger that 5 mb'})
            else:
                KebabSpotPhoto.objects.create(
                    spot=spot,
                    user=self.request.user,
                    photo=photo
                )


class DetailsKebabSpotAPIView(generics.RetrieveAPIView):
    serializer_class = KebabSpotDetailSerializer
    queryset = KebabSpot.objects.all()


class UpdateKebabSpotAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = KebabSpotDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KebabSpot.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):
        # updating the spot
        spot = serializer.save()

        # getting photos from request.FILES
        photos = self.request.FILES.getlist('photos')

        #if photos not given just do nothing
        if not photos:
            return

        # checking amount of photos
        if len(photos) > 10:
            raise ValidationError({'Photos': 'Maximum photos for upload is 10'})

        # checking size of every photo
        max_size = 5 * 1024 * 1024

        # creating object of every photo.
        for photo in photos:
            if photo.size > max_size:
                raise ValidationError({'Photos': f'Photo {photo.name} is too large. Must be not bigger that 5 mb'})
            else:
                KebabSpotPhoto.objects.create(
                    spot=spot,
                    user=self.request.user,
                    photo=photo
                )


class DeleteKebabSpotPhotoAPIView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = KebabSpotPhoto.objects.all()

    def get_queryset(self):
        return KebabSpotPhoto.objects.filter(user=self.request.user)


class RateKebabSpotAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        spot = get_object_or_404(KebabSpot, pk=pk)
        rating_value = request.data.get('value')

        if rating_value is None:
            return Response(
                {'error': 'Rating value wasn\'t given'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating_value = int(rating_value)
            if rating_value < 1 or rating_value > 5:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'error': 'Rating must be between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating, created = KebabSpotRating.objects.get_or_create(
            spot=spot,
            user=self.request.user,
            defaults={'value': rating_value}
        )
        if not created:
            rating.value = rating_value
            rating.save()

        spot.update_rating()

        return Response({
            'message': f'Thank you for your review! Your rating of this spot is {rating_value}.',
            'average_rating': float(spot.average_rating),
            'ratings_count': spot.ratings_count,
            'user_rating': rating_value
        }, status=status.HTTP_200_OK)
