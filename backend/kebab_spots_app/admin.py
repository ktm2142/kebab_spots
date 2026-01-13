from django.contrib.gis import admin
from .models import KebabSpot


@admin.register(KebabSpot)
class KebabSpotAdmin(admin.GISModelAdmin):
    list_display = ['id', 'name', 'user', 'average_rating']
    list_display_links = ['id', 'name', 'user']
    search_fields = ['id', 'name', 'user__username']
    readonly_fields = ['average_rating', 'ratings_count']
