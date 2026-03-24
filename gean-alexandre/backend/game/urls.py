from django.urls import path

from . import views

urlpatterns = [
    path('symbols', views.list_symbols, name='game-symbols'),
    path('new', views.new_session, name='game-new'),
    path('<uuid:session_id>/run', views.run, name='game-run'),
    path('<uuid:session_id>/run/10x', views.run_10x, name='game-run-10x'),
    path('<uuid:session_id>/run/<str:level>', views.run_forced, name='game-run-forced'),
]
