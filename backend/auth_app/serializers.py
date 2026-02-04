from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password as check_password
from .models import CustomUser
from kebab_spots_app.models import KebabSpot

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_2 = serializers.CharField(write_only=True)

    # simple check if password 1 and password 2 match
    def validate(self, attrs):
        if attrs['password'] != attrs['password_2']:
            raise serializers.ValidationError('Passwords doesn\'t match')
        return attrs

    def validate_password(self, value):
        user = CustomUser(username=self.initial_data.get('username'))
        check_password(value, user)
        return value

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'password_2']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'city', 'country']


class UserSpotsHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = KebabSpot
        fields =['id', 'name', 'average_rating', 'ratings_count']
