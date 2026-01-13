import requests
from rest_framework import generics, status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D

from .models import KebabSpot, KebabSpotRating
from .serializers import KebabSpotSerializer


amenities = [
    'private_territory', 'shop_nearby', 'gazebos', 'near_water',
    'fishing', 'trash_cans', 'tables', 'benches', 'fire_pit', 'toilet',
    'car_access'
]


def filter_by_amenities(queryset, query_params):
    for amenity in amenities:
        value = query_params.get(amenity)
        if value == 'true':
            queryset = queryset.filter(**{amenity: True})
    return queryset


class ListKebabSpotsAPIView(generics.ListAPIView):
    """
    Getting latitude, longitude and radius from query_params, and loading spots in given radius.
    If data in query_params is not valid we return basic queryset,
    and load all spots in standard radius which indicated in frontend
    """
    serializer_class = KebabSpotSerializer
    queryset = KebabSpot.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()

        lat = self.request.query_params.get('lat')
        lon = self.request.query_params.get('lon')
        radius = self.request.query_params.get('radius')

        if lat and lon:
            try:
                center_point = Point(float(lon), float(lat), srid=4326)
                qs = qs.filter(coordinates__distance_lte=(center_point, D(km=float(radius))))
            except (ValueError, TypeError):
                pass
        qs = filter_by_amenities(qs, self.request.query_params)
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
            nearby_spots = filter_by_amenities(nearby_spots, request.query_params)

            serializer = KebabSpotSerializer(nearby_spots, many=True)
            return Response({
                'location': {  # coordinates and name of town we searched
                    'name': data[0].get('name'),
                    'lat': lat,
                    'lon': lon
                },
                'spots': serializer.data  # list of kebab spot objects
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


class DetailsKebabSpotAPIView(generics.RetrieveAPIView):
    serializer_class = KebabSpotSerializer
    queryset = KebabSpot.objects.all()


class UpdateKebabSpotAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = KebabSpotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KebabSpot.objects.filter(
            user=self.request.user
        )


class CreateKebabSpotAPIView(generics.CreateAPIView):
    serializer_class = KebabSpotSerializer
    permission_classes = [IsAuthenticated]
    queryset = KebabSpot.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
            'message': 'Thank you for your review!',
            'average_rating': float(spot.average_rating),
            'ratings_count': spot.ratings_count
        }, status=status.HTTP_200_OK)