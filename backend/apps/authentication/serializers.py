# apps/authentication/serializers.py (COMPLETE VERSION)
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import AdminAccount, AccessCode
from django.db import transaction
from apps.core.constants import ADMIN_PERMISSIONS

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.ReadOnlyField()
    is_student = serializers.ReadOnlyField()
    is_super_admin = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'university', 'year', 
                 'role', 'status', 'subscription_plan', 'subscription_expiry', 
                 'avatar', 'phone', 'created_at', 'updated_at', 'last_login',
                 'is_admin', 'is_student', 'is_super_admin']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_admin', 'is_student', 'is_super_admin']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

class AdminAccountCreateSerializer(serializers.ModelSerializer):
    # User fields
    email = serializers.EmailField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    # Admin fields
    role = serializers.ChoiceField(choices=AdminAccount.ADMIN_ROLE_CHOICES)
    permissions = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True,
        required=False
    )
    
    # Read-only fields
    user = UserSerializer(read_only=True)

    class Meta:
        model = AdminAccount
        fields = ['id', 'user', 'email', 'full_name', 'username', 'password', 
                 'role', 'permissions', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_permissions(self, value):
        """Validate that all permissions are valid"""
        if not value:
            return value
        
        valid_permissions = set(ADMIN_PERMISSIONS.keys())
        invalid_permissions = set(value) - valid_permissions
        
        if invalid_permissions:
            raise serializers.ValidationError(
                f"Invalid permissions: {', '.join(invalid_permissions)}"
            )
        
        return value

    def validate(self, attrs):
        """Auto-assign permissions based on role if not provided"""
        role = attrs.get('role')
        permissions = attrs.get('permissions', [])
        
        # Auto-assign permissions based on role if none provided
        if not permissions:
            if role == 'super_admin':
                attrs['permissions'] = list(ADMIN_PERMISSIONS.keys())
            elif role == 'admin':
                attrs['permissions'] = [
                    'users.view', 'users.create', 'users.edit', 'users.suspend',
                    'questions.view', 'questions.create', 'questions.edit', 'questions.moderate',
                    'codes.view', 'codes.generate', 'codes.download',
                    'stats.view', 'stats.export',
                ]
            elif role == 'moderator':
                attrs['permissions'] = [
                    'users.view', 'users.suspend',
                    'questions.view', 'questions.moderate',
                    'codes.view',
                    'stats.view',
                ]
            elif role == 'viewer':
                attrs['permissions'] = [
                    'users.view',
                    'questions.view',
                    'codes.view',
                    'stats.view',
                ]
        
        # For super_admin, always ensure they have ALL permissions
        if role == 'super_admin':
            attrs['permissions'] = list(ADMIN_PERMISSIONS.keys())
        
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            # Extract user data
            user_data = {
                'username': validated_data.pop('username'),
                'email': validated_data.pop('email'),
                'full_name': validated_data.pop('full_name'),
                'role': validated_data['role'],
                'status': 'active'  # Admins are active by default
            }
            password = validated_data.pop('password')
            
            # Create user
            user = User.objects.create_user(
                password=password,
                **user_data
            )

            # Create admin account
            admin_account = AdminAccount.objects.create(
                user=user,
                role=validated_data['role'],
                permissions=validated_data.get('permissions', []),
                created_by=self.context['request'].user
            )
            
            return admin_account

class AdminAccountUpdateSerializer(serializers.ModelSerializer):
    # User fields
    full_name = serializers.CharField(source='user.full_name', required=False)
    
    # Admin fields
    role = serializers.ChoiceField(choices=AdminAccount.ADMIN_ROLE_CHOICES, required=False)
    permissions = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True,
        required=False
    )
    
    # Read-only fields
    user = UserSerializer(read_only=True)

    class Meta:
        model = AdminAccount
        fields = ['id', 'user', 'full_name', 'role', 'permissions']
        read_only_fields = ['id']

    def validate_permissions(self, value):
        """Validate that all permissions are valid"""
        if not value:
            return value
        
        valid_permissions = set(ADMIN_PERMISSIONS.keys())
        invalid_permissions = set(value) - valid_permissions
        
        if invalid_permissions:
            raise serializers.ValidationError(
                f"Invalid permissions: {', '.join(invalid_permissions)}"
            )
        
        return value

    def validate(self, attrs):
        """Auto-assign permissions based on role if role is changed"""
        role = attrs.get('role')
        permissions = attrs.get('permissions')
        
        # If role is being changed and no permissions provided, auto-assign
        if role and permissions is None:
            if role == 'super_admin':
                attrs['permissions'] = list(ADMIN_PERMISSIONS.keys())
            elif role == 'admin':
                attrs['permissions'] = [
                    'users.view', 'users.create', 'users.edit', 'users.suspend',
                    'questions.view', 'questions.create', 'questions.edit', 'questions.moderate',
                    'codes.view', 'codes.generate', 'codes.download',
                    'stats.view', 'stats.export',
                ]
            elif role == 'moderator':
                attrs['permissions'] = [
                    'users.view', 'users.suspend',
                    'questions.view', 'questions.moderate',
                    'codes.view',
                    'stats.view',
                ]
            elif role == 'viewer':
                attrs['permissions'] = [
                    'users.view',
                    'questions.view',
                    'codes.view',
                    'stats.view',
                ]
        
        # For super_admin, always ensure they have ALL permissions
        if role == 'super_admin' or (not role and self.instance.role == 'super_admin'):
            attrs['permissions'] = list(ADMIN_PERMISSIONS.keys())
        
        return attrs

    def update(self, instance, validated_data):
        with transaction.atomic():
            # Handle nested user data update
            user_data = {}
            if 'user' in validated_data:
                user_data = validated_data.pop('user')
            
            if user_data:
                for attr, value in user_data.items():
                    setattr(instance.user, attr, value)
                instance.user.save()

            # Handle AdminAccount data update
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()
            return instance

class AdminAccountSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    created_by_user = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = AdminAccount
        fields = ['id', 'user', 'role', 'permissions', 'created_at', 'last_login', 
                 'created_by', 'created_by_user']
        read_only_fields = ['id', 'created_at', 'created_by', 'created_by_user']

class AccessCodeSerializer(serializers.ModelSerializer):
    used_by = serializers.SerializerMethodField()
    
    class Meta:
        model = AccessCode
        fields = ['id', 'code', 'package', 'status', 'used_by', 'used_date', 'created_at']
        read_only_fields = ['id', 'created_at', 'code']
    
    def get_used_by(self, obj):
        if obj.used_by:
            return {
                'id': obj.used_by.id,
                'full_name': obj.used_by.full_name or obj.used_by.username,
                'email': obj.used_by.email,
                'university': obj.used_by.university or 'Not specified',
                'year': obj.used_by.year or 0
            }
        return None