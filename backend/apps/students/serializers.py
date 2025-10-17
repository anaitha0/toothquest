# apps/students/serializers.py
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import (
    Quiz, QuizQuestion, QuizSession, QuizAnswer, 
    StudentCalendarEvent, StudentNote, StudentPreference
)
from apps.questions.serializers import QuestionSerializer
from apps.authentication.serializers import UserSerializer

# Add this import:
from apps.authentication.models import User # <--- ADD THIS LINE

class QuizListSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    questions_count = serializers.ReadOnlyField()
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'module_name', 'course_name', 
            'year', 'difficulty', 'difficulty_display', 'time_limit_minutes', 
            'questions_count', 'passing_score', 'status', 'is_public', 
            'created_by', 'created_at'
        ]
    
    def get_created_by(self, obj):
        return {
            'id': obj.created_by.id,
            'name': obj.created_by.full_name or obj.created_by.username,
            'email': obj.created_by.email
        }

class QuizDetailSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'module_name', 'course_name', 
            'year', 'difficulty', 'time_limit_minutes', 'questions_count', 
            'passing_score', 'status', 'is_public', 'created_by', 
            'created_at', 'questions'
        ]
    
    def get_questions(self, obj):
        # Get questions with their options
        quiz_questions = obj.quiz_questions.select_related('question').prefetch_related('question__options')
        questions_data = []
        
        for quiz_q in quiz_questions:
            question = quiz_q.question
            question_data = QuestionSerializer(question).data
            question_data['points'] = quiz_q.points
            question_data['order'] = quiz_q.order
            questions_data.append(question_data)
        
        return questions_data
    
    def get_created_by(self, obj):
        return {
            'id': obj.created_by.id,
            'name': obj.created_by.full_name or obj.created_by.username,
            'email': obj.created_by.email
        }

class QuizSessionSerializer(serializers.ModelSerializer):
    quiz = QuizListSerializer(read_only=True)
    quiz_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)
    percentage_score = serializers.ReadOnlyField()
    time_remaining_seconds = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizSession
        fields = [
            'id', 'quiz', 'quiz_id', 'user', 'status', 'started_at', 
            'completed_at', 'expires_at', 'score', 'total_questions', 
            'correct_answers', 'time_spent_seconds', 'percentage_score',
            'time_remaining_seconds'
        ]
        read_only_fields = ['user', 'started_at', 'expires_at']
    
    def get_time_remaining_seconds(self, obj):
        if obj.status != 'in_progress':
            return 0
        
        now = timezone.now()
        if now >= obj.expires_at:
            return 0
        
        return int((obj.expires_at - now).total_seconds())
    
    def create(self, validated_data):
        quiz = Quiz.objects.get(id=validated_data['quiz_id'])
        user = self.context['request'].user
        
        # Check if user already has an active session for this quiz
        existing_session = QuizSession.objects.filter(
            user=user, 
            quiz=quiz, 
            status='in_progress'
        ).first()
        
        if existing_session:
            return existing_session
        
        # Create new session
        expires_at = timezone.now() + timedelta(minutes=quiz.time_limit_minutes)
        
        session = QuizSession.objects.create(
            user=user,
            quiz=quiz,
            expires_at=expires_at,
            total_questions=quiz.questions_count
        )
        
        return session

class QuizAnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(write_only=True)
    is_correct = serializers.ReadOnlyField()
    
    class Meta:
        model = QuizAnswer
        fields = [
            'id', 'question_id', 'selected_option', 'is_correct', 
            'time_taken_seconds', 'flagged', 'created_at'
        ]
    
    def create(self, validated_data):
        quiz_session = self.context['quiz_session']
        question_id = validated_data.pop('question_id')
        
        from apps.questions.models import Question
        question = Question.objects.get(id=question_id)
        
        # Check if answer is correct
        is_correct = question.options.filter(
            option_letter=validated_data['selected_option'], 
            is_correct=True
        ).exists()
        
        # Update or create answer
        answer, created = QuizAnswer.objects.update_or_create(
            quiz_session=quiz_session,
            question=question,
            defaults={
                'selected_option': validated_data['selected_option'],
                'is_correct': is_correct,
                'time_taken_seconds': validated_data.get('time_taken_seconds', 0),
                'flagged': validated_data.get('flagged', False)
            }
        )
        
        return answer

class StudentCalendarEventSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentCalendarEvent
        fields = [
            'id', 'user', 'title', 'description', 'event_type', 
            'event_date', 'location', 'priority', 'is_completed', 
            'reminder_enabled', 'tags', 'color', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class StudentNoteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentNote
        fields = [
            'id', 'user', 'title', 'content', 'module_name', 
            'tags', 'is_favorite', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class StudentPreferenceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentPreference
        fields = [
            'id', 'user', 'preferred_study_time', 'daily_study_goal_minutes',
            'difficulty_preference', 'favorite_modules', 'reminder_frequency',
            'theme_preference', 'notification_enabled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user']

class QuizResultSerializer(serializers.ModelSerializer):
    quiz = QuizListSerializer(read_only=True)
    answers = serializers.SerializerMethodField()
    percentage_score = serializers.ReadOnlyField()
    passed = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizSession
        fields = [
            'id', 'quiz', 'status', 'started_at', 'completed_at', 
            'score', 'total_questions', 'correct_answers', 
            'time_spent_seconds', 'percentage_score', 'passed', 'answers'
        ]
    
    def get_answers(self, obj):
        answers = obj.answers.select_related('question').prefetch_related('question__options')
        return [{
            'question_id': answer.question.id,
            'question_text': answer.question.question_text,
            'selected_option': answer.selected_option,
            'correct_option': answer.question.options.filter(is_correct=True).first().option_letter,
            'is_correct': answer.is_correct,
            'explanation': answer.question.explanation,
            'flagged': answer.flagged,
            'time_taken_seconds': answer.time_taken_seconds
        } for answer in answers]
    
    def get_passed(self, obj):
        return obj.percentage_score >= obj.quiz.passing_score if obj.percentage_score else False

# Dashboard related serializers
class StudentDashboardStatsSerializer(serializers.Serializer):
    total_quizzes_completed = serializers.IntegerField()
    average_score = serializers.FloatField()
    total_questions_answered = serializers.IntegerField()
    total_study_hours = serializers.FloatField()
    recent_quizzes = serializers.ListField()
    upcoming_events = serializers.ListField()
    performance_trend = serializers.ListField()

class StudentProfileSerializer(serializers.ModelSerializer):
    quiz_stats = serializers.SerializerMethodField()
    preferences = StudentPreferenceSerializer(source='student_preferences', read_only=True)
    
    class Meta:
        model = User # <--- 'User' is used here
        fields = [
            'id', 'username', 'email', 'full_name', 'university', 
            'year', 'phone', 'avatar', 'created_at', 'last_login',
            'quiz_stats', 'preferences'
        ]
        read_only_fields = ['id', 'username', 'created_at', 'last_login']
    
    def get_quiz_stats(self, obj):
        sessions = QuizSession.objects.filter(user=obj, status='completed')
        if not sessions.exists():
            return {
                'total_completed': 0,
                'average_score': 0,
                'total_questions': 0,
                'total_time_spent': 0
            }
        
        total_completed = sessions.count()
        avg_score = sessions.aggregate(avg=serializers.models.Avg('score'))['avg'] or 0
        total_questions = sessions.aggregate(total=serializers.models.Sum('total_questions'))['total'] or 0
        total_time = sessions.aggregate(total=serializers.models.Sum('time_spent_seconds'))['total'] or 0
        
        return {
            'total_completed': total_completed,
            'average_score': round(avg_score, 1),
            'total_questions': total_questions,
            'total_time_spent': round(total_time / 3600, 1)  # Convert to hours
        }