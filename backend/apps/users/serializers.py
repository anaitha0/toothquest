from rest_framework import serializers
from apps.authentication.models import User
from .models import UserActivity, QuizAttempt, UserProgress

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'university', 'year', 
                 'role', 'status', 'subscription_plan', 'subscription_expiry', 
                 'created_at', 'last_login']

class UserDetailSerializer(serializers.ModelSerializer):
    accuracy_percentage = serializers.SerializerMethodField()
    total_attempts = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'university', 'year', 
                 'role', 'status', 'subscription_plan', 'subscription_expiry', 
                 'avatar', 'phone', 'created_at', 'last_login', 'accuracy_percentage', 
                 'total_attempts']
    
    def get_accuracy_percentage(self, obj):
        if hasattr(obj, 'progress'):
            return obj.progress.accuracy_percentage
        return 0
    
    def get_total_attempts(self, obj):
        if hasattr(obj, 'progress'):
            return obj.progress.total_questions_attempted
        return 0

class UserActivitySerializer(serializers.ModelSerializer):
    user = UserListSerializer(read_only=True)
    
    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'action', 'details', 'ip_address', 'created_at']

class QuizAttemptSerializer(serializers.ModelSerializer):
    user = UserListSerializer(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'question', 'selected_option', 'is_correct', 
                 'time_taken', 'created_at']

class UserProgressSerializer(serializers.ModelSerializer):
    accuracy_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'total_questions_attempted', 'correct_answers', 
                 'total_study_time', 'accuracy_percentage', 'created_at', 'updated_at']