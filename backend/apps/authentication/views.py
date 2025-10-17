# apps/authentication/views.py (UPDATED WITH ACCESS CODES LIST)
from nbformat import ValidationError
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import permissions
from django.utils import timezone
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import User, AdminAccount, AccessCode
from .serializers import (
    UserSerializer, LoginSerializer, AccessCodeSerializer,
    AdminAccountCreateSerializer, AdminAccountUpdateSerializer, AdminAccountSerializer
)
from apps.core.permissions import IsSuperAdminUser, IsAdminUser
from apps.core.constants import ADMIN_PERMISSIONS

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.permissions import AllowAny
@api_view(['POST'])
@permission_classes([])  # AllowAny
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        login_time = timezone.now()
        user.last_login = login_time
        user.save(update_fields=['last_login'])
        
        # Update AdminAccount last_login if exists
        if hasattr(user, 'adminaccount'):
            user.adminaccount.last_login = login_time
            user.adminaccount.save(update_fields=['last_login'])
        
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'message': 'Successfully logged out'})

@api_view(['GET'])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# Admin Account Management Views
class AdminAccountListCreateView(generics.ListCreateAPIView):
    queryset = AdminAccount.objects.select_related('user', 'created_by').order_by('-created_at')
    permission_classes = [IsSuperAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminAccountCreateSerializer
        return AdminAccountSerializer
    
    def perform_create(self, serializer):
        # The serializer handles the creation of both User and AdminAccount
        serializer.save()

class AdminAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AdminAccount.objects.select_related('user', 'created_by')
    permission_classes = [IsSuperAdminUser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AdminAccountUpdateSerializer
        return AdminAccountSerializer
    
    def perform_destroy(self, instance):
        # Don't allow deleting the last super admin
        if instance.role == 'super_admin':
            super_admin_count = AdminAccount.objects.filter(role='super_admin').count()
            if super_admin_count <= 1:
                raise ValidationError("Cannot delete the last super admin account.")
        
        # Delete the associated user as well
        user = instance.user
        instance.delete()
        user.delete()

@api_view(['POST'])
@permission_classes([IsSuperAdminUser])
def update_admin_status(request, pk):
    try:
        admin_account = AdminAccount.objects.get(pk=pk)
        user = admin_account.user
    except AdminAccount.DoesNotExist:
        return Response({'error': 'Admin account not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    valid_statuses = ['active', 'inactive', 'suspended']
    
    if new_status not in valid_statuses:
        return Response({'error': 'Invalid status provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Don't allow suspending the last active super admin
    if (new_status in ['inactive', 'suspended'] and 
        admin_account.role == 'super_admin' and 
        user.status == 'active'):
        active_super_admins = AdminAccount.objects.filter(
            role='super_admin', 
            user__status='active'
        ).count()
        if active_super_admins <= 1:
            return Response({
                'error': 'Cannot suspend the last active super admin'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    user.status = new_status
    user.save(update_fields=['status'])
    
    return Response({
        'message': f'Admin status updated to {new_status}',
        'admin': AdminAccountSerializer(admin_account).data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsSuperAdminUser])
def get_permissions_list(request):
    """Return all available permissions"""
    return Response(ADMIN_PERMISSIONS)

# Access Code Management
class AccessCodeListCreateView(generics.ListCreateAPIView):
    queryset = AccessCode.objects.select_related('used_by').order_by('-created_at')
    serializer_class = AccessCodeSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'package']
    search_fields = ['code', 'package', 'used_by__full_name', 'used_by__email']
    ordering_fields = ['created_at', 'package', 'status']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        # Generate unique code
        import random
        import string
        
        package = serializer.validated_data['package']
        
        # Package prefixes
        prefixes = {
            '1st Year Package': 'TQ1',
            '2nd Year Package': 'TQ2', 
            '3rd Year Package': 'TQ3',
            '4th Year Package': 'TQ4',
            '5th Year Package': 'TQ5',
            'Complete Package': 'TQC',
        }
        
        prefix = prefixes.get(package, 'TQ')
        
        # Generate unique code
        while True:
            random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            code = f"{prefix}-{random_part}"
            if not AccessCode.objects.filter(code=code).exists():
                break
        
        serializer.save(code=code)

class AccessCodeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AccessCode.objects.select_related('used_by')
    serializer_class = AccessCodeSerializer
    permission_classes = [IsAdminUser]

@api_view(['GET'])
@permission_classes([])  # Allow any - for debugging only
def debug_auth(request):
    """Debug endpoint to check authentication status"""
    if request.user.is_authenticated:
        admin_account = None
        if hasattr(request.user, 'adminaccount'):
            admin_account = {
                'role': request.user.adminaccount.role,
                'permissions': request.user.adminaccount.permissions,
                'last_login': request.user.adminaccount.last_login,
            }
        
        return Response({
            'authenticated': True,
            'user_id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'role': request.user.role,
            'status': request.user.status,
            'is_admin_property': getattr(request.user, 'is_admin', None),
            'is_student_property': getattr(request.user, 'is_student', None),
            'token_header': request.META.get('HTTP_AUTHORIZATION', 'No token header'),
            'admin_account': admin_account,
        })
    else:
        return Response({
            'authenticated': False,
            'user': str(request.user),
            'token_header': request.META.get('HTTP_AUTHORIZATION', 'No token header'),
        })
        
@api_view(['POST'])
@permission_classes([AllowAny])
def validate_access_code(request):
    """Validate an access code without using it"""
    code = request.data.get('code', '').strip().upper()
    
    if not code:
        return Response({'error': 'Access code is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        access_code = AccessCode.objects.get(code=code)
        return Response({
            'valid': True,
            'status': access_code.status,
            'package': access_code.package,
            'used_by': access_code.used_by.full_name if access_code.used_by else None,
            'used_date': access_code.used_date.isoformat() if access_code.used_date else None
        })
    except AccessCode.DoesNotExist:
        return Response({
            'valid': False,
            'status': 'invalid',
            'package': None,
            'error': 'Invalid access code'
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user with access code validation"""
    data = request.data
    
    # Extract and validate required fields
    required_fields = ['username', 'email', 'password', 'full_name', 'university', 'year', 'access_code']
    for field in required_fields:
        if not data.get(field):
            return Response({'error': f'{field} is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Clean and prepare data
    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    full_name = data['full_name'].strip()
    university = data['university']
    year = int(data['year'])
    phone = data.get('phone', '').strip()
    access_code = data['access_code'].strip().upper()
    
    # Validate access code first
    try:
        code_obj = AccessCode.objects.get(code=access_code)
        if code_obj.status != 'unused':
            return Response({
                'error': 'This access code has already been used',
                'access_code': ['This access code has already been used']
            }, status=status.HTTP_400_BAD_REQUEST)
    except AccessCode.DoesNotExist:
        return Response({
            'error': 'Invalid access code',
            'access_code': ['Invalid access code']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate username
    if len(username) < 3:
        return Response({
            'error': 'Username must be at least 3 characters',
            'username': ['Username must be at least 3 characters']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({
            'error': 'Username already exists',
            'username': ['A user with this username already exists']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email
    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'Email already registered',
            'email': ['A user with this email already exists']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password
    try:
        validate_password(password)
    except DjangoValidationError as e:
        return Response({
            'error': 'Password validation failed',
            'password': list(e.messages)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate year
    if year not in [1, 2, 3, 4, 5]:
        return Response({
            'error': 'Invalid year',
            'year': ['Year must be between 1 and 5']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate phone if provided
    if phone:
        import re
        if not re.match(r'^(\+213|0)[5-7][0-9]{8}$', phone):
            return Response({
                'error': 'Invalid phone number format',
                'phone': ['Please enter a valid Algerian phone number']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create user and use access code in a transaction
    try:
        with transaction.atomic():
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                full_name=full_name,
                university=university,
                year=year,
                phone=phone,
                role='student',
                status='active',  # You might want to set to 'pending' and require email verification
                subscription_plan=code_obj.package
            )
            
            # Mark the access code as used
            code_obj.status = 'used'
            code_obj.used_by = user
            code_obj.used_date = timezone.now()
            code_obj.save()
            
            # Create user progress record
            from apps.users.models import UserProgress
            UserProgress.objects.create(user=user)
            
            # Send welcome email (optional)
            # send_welcome_email.delay(user.id)
            
            return Response({
                'message': 'Registration successful! Welcome to ToothQuest.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.full_name,
                    'university': user.university,
                    'year': user.year,
                    'subscription_plan': user.subscription_plan,
                    'status': user.status
                }
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add this to your existing login_view to handle the subscription package info
@api_view(['POST'])
@permission_classes([AllowAny])
def enhanced_login_view(request):
    """Enhanced login with subscription info"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        login_time = timezone.now()
        user.last_login = login_time
        user.save(update_fields=['last_login'])
        
        # Update AdminAccount last_login if exists
        if hasattr(user, 'adminaccount'):
            user.adminaccount.last_login = login_time
            user.adminaccount.save(update_fields=['last_login'])
        
        token, created = Token.objects.get_or_create(user=user)
        
        # Get subscription info
        subscription_info = None
        if user.role == 'student':
            try:
                # Get the access code used by this user
                used_code = AccessCode.objects.filter(used_by=user).first()
                if used_code:
                    subscription_info = {
                        'package': used_code.package,
                        'activated_date': used_code.used_date.isoformat() if used_code.used_date else None,
                        'code_used': used_code.code
                    }
            except:
                pass
        
        user_data = UserSerializer(user).data
        if subscription_info:
            user_data['subscription_info'] = subscription_info
        
        return Response({
            'token': token.key,
            'user': user_data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)