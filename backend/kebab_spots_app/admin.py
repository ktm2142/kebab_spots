from django.contrib.gis import admin
from .models import KebabSpot, KebabSpotPhoto, KebabSpotComplaint


class KebabSpotPhotoInline(admin.TabularInline):
    model = KebabSpotPhoto
    extra = 0


class KebabSpotComplaintInline(admin.TabularInline):
    model = KebabSpotComplaint
    extra = 0
    readonly_fields = ['user', 'created_at']


@admin.register(KebabSpot)
class KebabSpotAdmin(admin.GISModelAdmin):
    list_display = ['id', 'name', 'user', 'average_rating', 'hidden']
    list_display_links = ['id', 'name', 'user', 'hidden']
    search_fields = ['id', 'name', 'user__username']
    readonly_fields = ['average_rating', 'ratings_count']
    inlines = [KebabSpotPhotoInline, KebabSpotComplaintInline]