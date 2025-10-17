# apps/authentication/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AdminAccount, AccessCode

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'full_name', 'role', 'status', 'created_at']
    list_filter = ['role', 'status', 'year', 'created_at']
    search_fields = ['email', 'username', 'full_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('full_name', 'university', 'year', 'role', 'status', 
                      'subscription_plan', 'subscription_expiry', 'avatar', 'phone')
        }),
    )

@admin.register(AdminAccount)
class AdminAccountAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'created_at', 'last_login']
    list_filter = ['role', 'created_at']
    search_fields = ['user__email', 'user__full_name']

@admin.register(AccessCode)
class AccessCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'package', 'status', 'used_by', 'created_at']
    list_filter = ['package', 'status', 'created_at']
    search_fields = ['code', 'used_by__email']