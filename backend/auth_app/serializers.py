from rest_framework import serializers
from .models import CustomUser


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_2 = serializers.CharField(write_only=True)

    # simple check if password 1 and password 2 match
    def validate(self, attrs):
        if attrs['password'] != attrs['password_2']:
            raise serializers.ValidationError('passwords doesn\'t match')
        return attrs

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'password_2']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'city', 'country']