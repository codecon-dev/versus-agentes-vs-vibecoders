from django.contrib import admin

from .models import GameResult, GameSession


class GameResultInline(admin.TabularInline):
    model = GameResult
    extra = 0
    readonly_fields = ('symbol_1', 'symbol_2', 'symbol_3', 'points', 'created_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('player_name', 'id', 'balance', 'created_at')
    search_fields = ('player_name',)
    readonly_fields = ('id', 'player_name', 'balance', 'created_at')
    inlines = [GameResultInline]


@admin.register(GameResult)
class GameResultAdmin(admin.ModelAdmin):
    list_display = ('session', 'symbol_1', 'symbol_2', 'symbol_3', 'points', 'created_at')
    list_filter = ('session__player_name',)
    readonly_fields = ('session', 'symbol_1', 'symbol_2', 'symbol_3', 'points', 'created_at')
