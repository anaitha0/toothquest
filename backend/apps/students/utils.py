# apps/students/utils.py
import random
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg
from .models import Quiz, QuizSession, QuizQuestion
from apps.questions.models import Question

def generate_quiz_questions(quiz, questions_count=None):
    """
    Generate questions for a quiz based on module, year, and difficulty
    """
    if questions_count is None:
        questions_count = quiz.questions_count
    
    # Get available questions matching quiz criteria
    available_questions = Question.objects.filter(
        module_name=quiz.module_name,
        year=quiz.year,
        difficulty=quiz.difficulty,
        is_active=True
    )
    
    if quiz.course_name:
        available_questions = available_questions.filter(course_name=quiz.course_name)
    
    # If we don't have enough questions, expand criteria
    if available_questions.count() < questions_count:
        # Try without course filter
        available_questions = Question.objects.filter(
            module_name=quiz.module_name,
            year=quiz.year,
            is_active=True
        )
        
        # If still not enough, try different difficulty
        if available_questions.count() < questions_count:
            available_questions = Question.objects.filter(
                module_name=quiz.module_name,
                is_active=True
            )
    
    # Randomly select questions
    selected_questions = random.sample(
        list(available_questions), 
        min(questions_count, available_questions.count())
    )
    
    # Create QuizQuestion objects
    for i, question in enumerate(selected_questions):
        QuizQuestion.objects.get_or_create(
            quiz=quiz,
            question=question,
            defaults={'order': i + 1, 'points': 1}
        )
    
    return selected_questions

def calculate_quiz_statistics(quiz):
    """
    Calculate statistics for a quiz based on all sessions
    """
    sessions = QuizSession.objects.filter(quiz=quiz, status='completed')
    
    if not sessions.exists():
        return {
            'total_attempts': 0,
            'average_score': 0,
            'pass_rate': 0,
            'average_time': 0,
            'difficulty_rating': 'N/A'
        }
    
    total_attempts = sessions.count()
    average_score = sessions.aggregate(avg=Avg('score'))['avg']
    passed_sessions = sessions.filter(score__gte=quiz.passing_score).count()
    pass_rate = (passed_sessions / total_attempts) * 100
    average_time = sessions.aggregate(avg=Avg('time_spent_seconds'))['avg']
    
    # Determine difficulty rating based on pass rate
    if pass_rate >= 80:
        difficulty_rating = 'Easy'
    elif pass_rate >= 60:
        difficulty_rating = 'Medium'
    elif pass_rate >= 40:
        difficulty_rating = 'Hard'
    else:
        difficulty_rating = 'Very Hard'
    
    return {
        'total_attempts': total_attempts,
        'average_score': round(average_score, 1),
        'pass_rate': round(pass_rate, 1),
        'average_time': round(average_time / 60, 1) if average_time else 0,  # Convert to minutes
        'difficulty_rating': difficulty_rating
    }

def get_student_recommendations(user):
    """
    Get personalized quiz recommendations for a student
    """
    # Get completed quizzes to avoid recommending them
    completed_quiz_ids = QuizSession.objects.filter(
        user=user, 
        status='completed'
    ).values_list('quiz_id', flat=True)
    
    # Get available quizzes
    available_quizzes = Quiz.objects.filter(
        status='active',
        is_public=True
    ).exclude(id__in=completed_quiz_ids)
    
    # Filter by user's year
    if hasattr(user, 'year') and user.year:
        available_quizzes = available_quizzes.filter(year=user.year)
    
    # Get user's performance history to recommend appropriate difficulty
    recent_sessions = QuizSession.objects.filter(
        user=user, 
        status='completed'
    ).order_by('-completed_at')[:10]
    
    if recent_sessions.exists():
        avg_recent_score = recent_sessions.aggregate(avg=Avg('score'))['avg']
        
        # Recommend difficulty based on recent performance
        if avg_recent_score >= 85:
            preferred_difficulties = ['hard', 'medium']
        elif avg_recent_score >= 70:
            preferred_difficulties = ['medium', 'easy']
        else:
            preferred_difficulties = ['easy', 'medium']
        
        # Prioritize by difficulty preference
        recommended = []
        for difficulty in preferred_difficulties:
            quizzes = available_quizzes.filter(difficulty=difficulty)[:3]
            recommended.extend(quizzes)
            if len(recommended) >= 5:
                break
        
        return recommended[:5]
    
    # For new users, recommend easy to medium difficulty
    return available_quizzes.filter(
        difficulty__in=['easy', 'medium']
    ).order_by('?')[:5]

def check_session_expiry():
    """
    Check and update expired quiz sessions
    """
    now = timezone.now()
    expired_sessions = QuizSession.objects.filter(
        status='in_progress',
        expires_at__lt=now
    )
    
    expired_count = expired_sessions.count()
    expired_sessions.update(status='expired')
    
    return expired_count

# apps/students/filters.py
import django_filters
from django.db import models
from .models import (
    Quiz, QuizSession, StudentCalendarEvent, StudentNote
)

class QuizFilter(django_filters.FilterSet):
    """Filter for Quiz model"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    module_name = django_filters.CharFilter(lookup_expr='icontains')
    course_name = django_filters.CharFilter(lookup_expr='icontains')
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = Quiz
        fields = ['module_name', 'course_name', 'year', 'difficulty', 'status', 'is_public']

class QuizSessionFilter(django_filters.FilterSet):
    """Filter for QuizSession model"""
    quiz_title = django_filters.CharFilter(field_name='quiz__title', lookup_expr='icontains')
    module_name = django_filters.CharFilter(field_name='quiz__module_name', lookup_expr='icontains')
    started_at = django_filters.DateFromToRangeFilter()
    completed_at = django_filters.DateFromToRangeFilter()
    score_min = django_filters.NumberFilter(field_name='score', lookup_expr='gte')
    score_max = django_filters.NumberFilter(field_name='score', lookup_expr='lte')
    
    class Meta:
        model = QuizSession
        fields = ['status', 'quiz__module_name', 'quiz__difficulty']

class StudentCalendarEventFilter(django_filters.FilterSet):
    """Filter for StudentCalendarEvent model"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    event_date = django_filters.DateFromToRangeFilter()
    location = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = StudentCalendarEvent
        fields = ['event_type', 'priority', 'is_completed']

class StudentNoteFilter(django_filters.FilterSet):
    """Filter for StudentNote model"""
    title = django_filters.CharFilter(lookup_expr='icontains')
    content = django_filters.CharFilter(lookup_expr='icontains')
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = StudentNote
        fields = ['module_name', 'is_favorite']