# backend/clients/urls.py
from django.urls import path
from . import views

# CLIENT URLS
urlpatterns = [
    path('register/', views.register_client, name='register_client'),
    path('login/', views.login_client, name='login_client'),
    path('logout/', views.logout_client, name='logout_client'),
    path('profile/', views.get_client_profile, name='get_client_profile'),
    path('list/', views.get_all_clients, name='get_all_clients'),
    path('update/<int:client_id>/', views.update_client, name='update_client'),
    path('delete/<int:client_id>/', views.delete_client, name='delete_client'),
]