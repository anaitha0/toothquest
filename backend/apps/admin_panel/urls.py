# apps/admin_panel/urls.py (UPDATED)
from django.urls import path
from . import views

urlpatterns = [
    # Dashboard endpoints
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('statistics/', views.statistics_data, name='statistics-data'),
    path('quick-stats/', views.quick_stats, name='quick-stats'),
    
    # Access codes
    path('generate-codes/', views.generate_access_codes, name='generate-access-codes'),
    
    # Settings
    path('settings/', views.settings_data, name='settings-data'),
    path('settings/update/', views.update_settings, name='update-settings'),
]