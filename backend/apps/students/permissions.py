# apps/students/permissions.py
from rest_framework import permissions

class IsStudentUser(permissions.BasePermission):
    """
    Custom permission to only allow student users to access student endpoints
    """
    
    def has_permission(self, request, view):
        return bool(request.user and 
                   request.user.is_authenticated and 
                   request.user.role == 'student')

class IsQuizSessionOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a quiz session to access it
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow if user is the session owner or admin
        return (obj.user == request.user or 
                request.user.role in ['admin', 'super_admin'])

class IsCalendarEventOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a calendar event to access it
    """
    
    def has_object_permission(self, request, view, obj):
        return (obj.user == request.user or 
                request.user.role in ['admin', 'super_admin'])

class IsNoteOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a note to access it
    """
    
    def has_object_permission(self, request, view, obj):
        return (obj.user == request.user or 
                request.user.role in ['admin', 'super_admin'])