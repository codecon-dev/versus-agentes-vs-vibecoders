from django.contrib import admin

from .models import Symbol


@admin.register(Symbol)
class SymbolAdmin(admin.ModelAdmin):
    list_display = ('name', 'level')
    list_filter = ('level',)
