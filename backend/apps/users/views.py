# apps/users/views.py (UPDATED)
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from apps.authentication.models import User
from .models import UserActivity, QuizAttempt, UserProgress
from .serializers import (
    UserListSerializer, UserDetailSerializer, UserActivitySerializer,
    QuizAttemptSerializer, UserProgressSerializer
)
from apps.core.permissions import IsAdminUser  # Import the custom permission

class UserListView(generics.ListAPIView):
    queryset = User.objects.filter(role='student')
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]  # Use the custom permission class
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'year', 'subscription_plan', 'university']
    search_fields = ['username', 'email', 'full_name', 'university']
    ordering_fields = ['created_at', 'last_login', 'full_name']
    ordering = ['-created_at']

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.filter(role='student')
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminUser]  # Use the custom permission class

@api_view(['POST'])
@permission_classes([IsAdminUser])  # Use the custom permission class
def activate_user(request, pk):
    try:
        user = User.objects.get(pk=pk, role='student')
        user.status = 'active'
        user.save()
        return Response({'message': 'User activated successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])  # Use the custom permission class
def block_user(request, pk):
    try:
        user = User.objects.get(pk=pk, role='student')
        user.status = 'blocked'
        user.save()
        return Response({'message': 'User blocked successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])  # Use the custom permission class
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk, role='student')
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UserActivityListView(generics.ListAPIView):
    queryset = UserActivity.objects.select_related('user')
    serializer_class = UserActivitySerializer
    permission_classes = [IsAdminUser]  # Use the custom permission class
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'action']
    search_fields = ['action', 'details', 'user__email']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

class QuizAttemptListView(generics.ListAPIView):
    queryset = QuizAttempt.objects.select_related('user', 'question')
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAdminUser]  # Use the custom permission class
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'question', 'is_correct']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

@api_view(['GET'])
@permission_classes([IsAdminUser])  # Use the custom permission class
def user_statistics(request):
    total_users = User.objects.filter(role='student').count()
    active_users = User.objects.filter(role='student', status='active').count()
    pending_users = User.objects.filter(role='student', status='pending').count()
    blocked_users = User.objects.filter(role='student', status='blocked').count()
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'pending_users': pending_users,
        'blocked_users': blocked_users,
    })