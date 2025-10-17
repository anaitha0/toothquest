# apps/core/permissions.py (UPDATED)
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has admin role
        admin_roles = ['super_admin', 'admin', 'moderator']
        return request.user.role in admin_roles

class IsSuperAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow super admin users to access.
    """
    
    def has_permission(self, request, view):
        return bool(request.user and 
                   request.user.is_authenticated and 
                   request.user.role == 'super_admin')

class IsModeratorOrAbove(permissions.BasePermission):
    """
    Custom permission to only allow moderator level or above.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        moderator_and_above = ['super_admin', 'admin', 'moderator']
        return request.user.role in moderator_and_above

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admin users to access it.
    """

    def has_object_permission(self, request, view, obj):
        # Check if user is admin
        admin_roles = ['super_admin', 'admin', 'moderator']
        if request.user.role in admin_roles:
            return True
        
        # Check if user is owner (for objects that have a user field)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if user is the object itself (for User model)
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
            
        return False