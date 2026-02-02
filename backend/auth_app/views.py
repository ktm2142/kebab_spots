from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import RegistrationSerializer, UserProfileSerializer, UserSpotsHistorySerializer
from kebab_spots_app.models import KebabSpot


class RegistrationAPIVIew(generics.CreateAPIView):
    serializer_class = RegistrationSerializer

    """
    This method allows user to enter personal information
    in registration form. Even if model will have more fields
    this method will stay the same.
    """
    def perform_create(self, serializer):
        validated_data = serializer.validated_data
        validated_data.pop('password_2')
        CustomUser.objects.create_user(**validated_data)


class UserProfileAPIVIew(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserHistoryAPIView(generics.ListAPIView):
    serializer_class = UserSpotsHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KebabSpot.objects.filter(user=self.request.user)
