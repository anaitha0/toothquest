# apps/authentication/urls.py (UPDATED WITH REGISTRATION)
from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.enhanced_login_view, name='login'),  # Use enhanced login
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('debug/', views.debug_auth, name='debug-auth'),
    
    # Registration
    path('register/', views.register_user, name='register'),
    path('validate-access-code/', views.validate_access_code, name='validate-access-code'),
    
    # Admin Account Management
    path('admin-accounts/', views.AdminAccountListCreateView.as_view(), name='admin-accounts-list'),
    path('admin-accounts/<int:pk>/', views.AdminAccountDetailView.as_view(), name='admin-accounts-detail'),
    path('admin-accounts/<int:pk>/status/', views.update_admin_status, name='admin-status-update'),
    
    # Permissions
    path('permissions/', views.get_permissions_list, name='permissions-list'),
    
    # Access Codes
    path('access-codes/', views.AccessCodeListCreateView.as_view(), name='access-codes-list'),
    path('access-codes/<int:pk>/', views.AccessCodeDetailView.as_view(), name='access-codes-detail'),
]