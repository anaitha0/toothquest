# apps/students/views.py
from pyexpat import model
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Count, Avg, Sum, Q
from datetime import timedelta, datetime
import random

from .models import (
    Quiz, QuizSession, QuizAnswer, StudentCalendarEvent, 
    StudentNote, StudentPreference
)
from .serializers import (
    QuizListSerializer, QuizDetailSerializer, QuizSessionSerializer,
    QuizAnswerSerializer, QuizResultSerializer, StudentCalendarEventSerializer,
    StudentNoteSerializer, StudentPreferenceSerializer, StudentDashboardStatsSerializer,
    StudentProfileSerializer
)
from apps.questions.models import Question
from apps.core.permissions import IsOwnerOrAdmin

# Quiz Views
class QuizListView(generics.ListAPIView):
    serializer_class = QuizListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['module_name', 'year', 'difficulty', 'status']
    search_fields = ['title', 'description', 'module_name', 'course_name']
    ordering_fields = ['created_at', 'title', 'difficulty']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Only show active public quizzes to students
        queryset = Quiz.objects.filter(status='active', is_public=True)
        
        # Filter by user's year if specified
        user = self.request.user
        if hasattr(user, 'year') and user.year:
            queryset = queryset.filter(year=user.year)
        
        return queryset

class QuizDetailView(generics.RetrieveAPIView):
    serializer_class = QuizDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Quiz.objects.filter(status='active', is_public=True)

# Quiz Session Views
class QuizSessionCreateView(generics.CreateAPIView):
    serializer_class = QuizSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user already has an active session for this quiz
        quiz_id = request.data.get('quiz_id')
        existing_session = QuizSession.objects.filter(
            user=request.user,
            quiz_id=quiz_id,
            status='in_progress'
        ).first()
        
        if existing_session:
            serializer = self.get_serializer(existing_session)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return super().create(request, *args, **kwargs)

class QuizSessionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = QuizSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        return QuizSession.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_quiz_answer(request, session_id):
    try:
        quiz_session = QuizSession.objects.get(
            id=session_id, 
            user=request.user,
            status='in_progress'
        )
    except QuizSession.DoesNotExist:
        return Response({'error': 'Quiz session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if session has expired
    if timezone.now() > quiz_session.expires_at:
        quiz_session.status = 'expired'
        quiz_session.save()
        return Response({'error': 'Quiz session has expired'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = QuizAnswerSerializer(
        data=request.data, 
        context={'quiz_session': quiz_session}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_quiz_session(request, session_id):
    try:
        quiz_session = QuizSession.objects.get(
            id=session_id, 
            user=request.user,
            status='in_progress'
        )
    except QuizSession.DoesNotExist:
        return Response({'error': 'Quiz session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Calculate final score
    answers = quiz_session.answers.all()
    correct_answers = answers.filter(is_correct=True).count()
    total_questions = answers.count()
    
    if total_questions > 0:
        score = (correct_answers / total_questions) * 100
    else:
        score = 0
    
    # Calculate time spent
    time_spent = int((timezone.now() - quiz_session.started_at).total_seconds())
    
    # Update session
    quiz_session.status = 'completed'
    quiz_session.completed_at = timezone.now()
    quiz_session.score = score
    quiz_session.correct_answers = correct_answers
    quiz_session.total_questions = total_questions
    quiz_session.time_spent_seconds = time_spent
    quiz_session.save()
    
    # Update user progress
    from apps.users.models import UserProgress
    progress, created = UserProgress.objects.get_or_create(user=request.user)
    progress.total_questions_attempted += total_questions
    progress.correct_answers += correct_answers
    progress.save()
    
    serializer = QuizResultSerializer(quiz_session)
    return Response(serializer.data, status=status.HTTP_200_OK)

class QuizSessionListView(generics.ListAPIView):
    serializer_class = QuizSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'quiz__module_name']
    ordering_fields = ['started_at', 'completed_at', 'score']
    ordering = ['-started_at']
    
    def get_queryset(self):
        return QuizSession.objects.filter(user=self.request.user).select_related('quiz')

# Calendar Views
class StudentCalendarEventListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentCalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type', 'priority', 'is_completed']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['event_date', 'created_at', 'priority']
    ordering = ['event_date']
    
    def get_queryset(self):
        queryset = StudentCalendarEvent.objects.filter(user=self.request.user)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(event_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(event_date__lte=end_date)
        
        return queryset

class StudentCalendarEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentCalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        return StudentCalendarEvent.objects.filter(user=self.request.user)

# Notes Views
class StudentNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['module_name', 'is_favorite']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        return StudentNote.objects.filter(user=self.request.user)

class StudentNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentNoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        return StudentNote.objects.filter(user=self.request.user)

# Preferences Views
class StudentPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preferences, created = StudentPreference.objects.get_or_create(user=self.request.user)
        return preferences

# Dashboard Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_dashboard_stats(request):
    user = request.user
    
    # Get completed quiz sessions
    completed_sessions = QuizSession.objects.filter(
        user=user, 
        status='completed'
    ).select_related('quiz')
    
    # Basic stats
    total_quizzes_completed = completed_sessions.count()
    average_score = completed_sessions.aggregate(avg=Avg('score'))['avg'] or 0
    total_questions_answered = completed_sessions.aggregate(
        total=Sum('total_questions')
    )['total'] or 0
    total_study_hours = completed_sessions.aggregate(
        total=Sum('time_spent_seconds')
    )['total'] or 0
    total_study_hours = round(total_study_hours / 3600, 1)  # Convert to hours
    
    # Recent quizzes (last 5)
    recent_quizzes = []
    recent_sessions = completed_sessions.order_by('-completed_at')[:5]
    for session in recent_sessions:
        recent_quizzes.append({
            'id': session.id,
            'title': session.quiz.title,
            'score': session.percentage_score,
            'date': session.completed_at.strftime('%d %b %Y'),
            'module': session.quiz.module_name,
            'questions_count': session.total_questions
        })
    
    # Upcoming calendar events
    upcoming_events = []
    now = timezone.now()
    upcoming = StudentCalendarEvent.objects.filter(
        user=user,
        event_date__gte=now,
        is_completed=False
    ).order_by('event_date')[:5]
    
    for event in upcoming:
        days_until = (event.event_date.date() - now.date()).days
        upcoming_events.append({
            'id': event.id,
            'title': event.title,
            'date': event.event_date.strftime('%d %b %Y'),
            'time': event.event_date.strftime('%H:%M'),
            'type': event.event_type,
            'priority': event.priority,
            'days_until': days_until
        })
    
    # Performance trend (last 7 days)
    performance_trend = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_sessions = completed_sessions.filter(
            completed_at__date=day.date()
        )
        avg_score = day_sessions.aggregate(avg=Avg('score'))['avg'] or 0
        performance_trend.append({
            'date': day.strftime('%Y-%m-%d'),
            'day': day.strftime('%a'),
            'score': round(avg_score, 1),
            'count': day_sessions.count()
        })
    
    data = {
        'total_quizzes_completed': total_quizzes_completed,
        'average_score': round(average_score, 1),
        'total_questions_answered': total_questions_answered,
        'total_study_hours': total_study_hours,
        'recent_quizzes': recent_quizzes,
        'upcoming_events': upcoming_events,
        'performance_trend': performance_trend
    }
    
    return Response(data, status=status.HTTP_200_OK)

# Profile Views
class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

# Recommended Quizzes
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommended_quizzes(request):
    user = request.user
    
    # Get user's completed quizzes to avoid recommending them again
    completed_quiz_ids = QuizSession.objects.filter(
        user=user, 
        status='completed'
    ).values_list('quiz_id', flat=True)
    
    # Get available quizzes excluding completed ones
    queryset = Quiz.objects.filter(
        status='active',
        is_public=True
    ).exclude(id__in=completed_quiz_ids)
    
    # Filter by user's year if available
    if hasattr(user, 'year') and user.year:
        queryset = queryset.filter(year=user.year)
    
    # Get user preferences
    try:
        preferences = user.student_preferences
        # Filter by preferred difficulty if set
        if preferences.difficulty_preference:
            difficulty_map = {
                'beginner': 'easy',
                'intermediate': 'medium',
                'advanced': 'hard'
            }
            preferred_difficulty = difficulty_map.get(preferences.difficulty_preference, 'medium')
            queryset = queryset.filter(difficulty=preferred_difficulty)
        
        # Prioritize favorite modules
        if preferences.favorite_modules:
            favorite_quizzes = queryset.filter(module_name__in=preferences.favorite_modules)
            other_quizzes = queryset.exclude(module_name__in=preferences.favorite_modules)
            # Combine with favorites first
            queryset = list(favorite_quizzes[:3]) + list(other_quizzes[:2])
        else:
            queryset = queryset[:5]
    except:
        queryset = queryset[:5]
    
    serializer = QuizListSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Statistics
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_statistics(request):
    user = request.user
    
    # Get all completed sessions
    sessions = QuizSession.objects.filter(user=user, status='completed')
    
    if not sessions.exists():
        return Response({
            'total_sessions': 0,
            'average_score': 0,
            'best_score': 0,
            'total_time_spent': 0,
            'modules_studied': [],
            'monthly_progress': [],
            'accuracy_by_difficulty': {}
        })
    
    # Basic statistics
    total_sessions = sessions.count()
    average_score = sessions.aggregate(avg=Avg('score'))['avg']
    best_score = sessions.aggregate(max=model.Max('score'))['max']
    total_time = sessions.aggregate(total=Sum('time_spent_seconds'))['total']
    
    # Modules studied with performance
    modules = sessions.values('quiz__module_name').annotate(
        count=Count('id'),
        avg_score=Avg('score'),
        total_questions=Sum('total_questions')
    ).order_by('-count')
    
    modules_studied = [{
        'module': module['quiz__module_name'],
        'quizzes_completed': module['count'],
        'average_score': round(module['avg_score'], 1),
        'total_questions': module['total_questions']
    } for module in modules]
    
    # Monthly progress (last 6 months)
    monthly_progress = []
    now = timezone.now()
    
    for i in range(5, -1, -1):
        month_start = (now - timedelta(days=30 * i)).replace(day=1)
        if i == 0:
            month_end = now
        else:
            month_end = (now - timedelta(days=30 * (i-1))).replace(day=1)
        
        month_sessions = sessions.filter(
            completed_at__gte=month_start,
            completed_at__lt=month_end
        )
        
        monthly_progress.append({
            'month': month_start.strftime('%b %Y'),
            'quizzes_completed': month_sessions.count(),
            'average_score': round(month_sessions.aggregate(avg=Avg('score'))['avg'] or 0, 1),
            'questions_answered': month_sessions.aggregate(total=Sum('total_questions'))['total'] or 0
        })
    
    # Accuracy by difficulty
    difficulty_stats = sessions.values('quiz__difficulty').annotate(
        count=Count('id'),
        avg_score=Avg('score')
    )
    
    accuracy_by_difficulty = {
        stat['quiz__difficulty']: {
            'average_score': round(stat['avg_score'], 1),
            'quizzes_completed': stat['count']
        } for stat in difficulty_stats
    }
    
    return Response({
        'total_sessions': total_sessions,
        'average_score': round(average_score, 1),
        'best_score': round(best_score, 1),
        'total_time_spent': round(total_time / 3600, 1),  # Convert to hours
        'modules_studied': modules_studied,
        'monthly_progress': monthly_progress,
        'accuracy_by_difficulty': accuracy_by_difficulty
    })

# Study Streak
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def study_streak(request):
    user = request.user
    
    # Get quiz sessions ordered by date
    sessions = QuizSession.objects.filter(
        user=user, 
        status='completed'
    ).order_by('-completed_at')
    
    if not sessions.exists():
        return Response({
            'current_streak': 0,
            'longest_streak': 0,
            'last_study_date': None
        })
    
    # Calculate current streak
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    
    # Get unique study dates
    study_dates = list(set([
        session.completed_at.date() 
        for session in sessions
    ]))
    study_dates.sort(reverse=True)
    
    # Calculate current streak
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    
    if study_dates and (study_dates[0] == today or study_dates[0] == yesterday):
        current_date = study_dates[0]
        current_streak = 1
        
        for i in range(1, len(study_dates)):
            expected_date = current_date - timedelta(days=1)
            if study_dates[i] == expected_date:
                current_streak += 1
                current_date = expected_date
            else:
                break
    
    # Calculate longest streak
    if study_dates:
        temp_streak = 1
        longest_streak = 1
        
        for i in range(1, len(study_dates)):
            expected_date = study_dates[i-1] - timedelta(days=1)
            if study_dates[i] == expected_date:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
    
    return Response({
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'last_study_date': study_dates[0].isoformat() if study_dates else None
    })

# Quiz Report (for question reporting)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def report_question(request):
    from apps.questions.models import QuestionReport, Question
    
    question_id = request.data.get('question_id')
    reason = request.data.get('reason', '')
    
    if not question_id:
        return Response({'error': 'Question ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user already reported this question
    existing_report = QuestionReport.objects.filter(
        question=question,
        reported_by=request.user
    ).first()
    
    if existing_report:
        return Response({'error': 'You have already reported this question'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create report
    QuestionReport.objects.create(
        question=question,
        reported_by=request.user,
        reason=reason or 'No reason provided'
    )
    
    return Response({'message': 'Question reported successfully'}, status=status.HTTP_201_CREATED)