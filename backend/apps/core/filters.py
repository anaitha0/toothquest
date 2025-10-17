import django_filters
from django.db import models
from apps.authentication.models import User
from apps.questions.models import Question, QuestionReport
from apps.users.models import QuizAttempt, UserActivity

class UserFilter(django_filters.FilterSet):
    """Filter for User model"""
    email = django_filters.CharFilter(lookup_expr='icontains')
    full_name = django_filters.CharFilter(lookup_expr='icontains')
    university = django_filters.CharFilter(lookup_expr='icontains')
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = User
        fields = ['role', 'status', 'year', 'subscription_plan']

class QuestionFilter(django_filters.FilterSet):
    """Filter for Question model"""
    question_text = django_filters.CharFilter(lookup_expr='icontains')
    module_name = django_filters.CharFilter(field_name='module__name', lookup_expr='icontains')
    course_name = django_filters.CharFilter(field_name='course__name', lookup_expr='icontains')
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = Question
        fields = ['module', 'course', 'year', 'difficulty', 'is_active']

class QuestionReportFilter(django_filters.FilterSet):
    """Filter for QuestionReport model"""
    reported_by_email = django_filters.CharFilter(field_name='reported_by__email', lookup_expr='icontains')
    question_text = django_filters.CharFilter(field_name='question__question_text', lookup_expr='icontains')
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = QuestionReport
        fields = ['status', 'question__module', 'question__year']

class QuizAttemptFilter(django_filters.FilterSet):
    """Filter for QuizAttempt model"""
    user_email = django_filters.CharFilter(field_name='user__email', lookup_expr='icontains')
    question_module = django_filters.CharFilter(field_name='question__module__name', lookup_expr='icontains')
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = QuizAttempt
        fields = ['user', 'question', 'is_correct', 'selected_option']

class UserActivityFilter(django_filters.FilterSet):
    """Filter for UserActivity model"""
    user_email = django_filters.CharFilter(field_name='user__email', lookup_expr='icontains')
    action = django_filters.CharFilter(lookup_expr='icontains')
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = UserActivity
        fields = ['user', 'action']