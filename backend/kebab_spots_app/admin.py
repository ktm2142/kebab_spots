from django.contrib.gis import admin
from .models import KebabSpot


@admin.register(KebabSpot)
class KebabSpotAdmin(admin.GISModelAdmin):
    list_display = ['id', 'name', 'user']
    list_display_links = ['id', 'name', 'user']
    search_fields = ['id', 'name', 'user__username']
