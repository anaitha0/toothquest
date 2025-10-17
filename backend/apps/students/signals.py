# apps/students/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from apps.authentication.models import User
from .models import QuizSession, StudentPreference, QuizAnswer

@receiver(post_save, sender=User)
def create_student_preferences(sender, instance=None, created=False, **kwargs):
    """
    Create default student preferences for new students
    """
    if created and instance.role == 'student':
        StudentPreference.objects.get_or_create(
            user=instance,
            defaults={
                'preferred_study_time': 'morning',
                'daily_study_goal_minutes': 120,
                'difficulty_preference': 'intermediate',
                'favorite_modules': [],
                'reminder_frequency': 'daily',
                'theme_preference': 'light',
                'notification_enabled': True
            }
        )

@receiver(pre_save, sender=QuizSession)
def check_quiz_session_expiry(sender, instance=None, **kwargs):
    """
    Automatically expire quiz sessions that have passed their time limit
    """
    if instance.status == 'in_progress' and timezone.now() > instance.expires_at:
        instance.status = 'expired'

@receiver(post_save, sender=QuizAnswer)
def update_session_progress(sender, instance, created, **kwargs):
    """
    Update quiz session progress when answers are submitted
    """
    if created:
        session = instance.quiz_session
        
        # Update session statistics
        total_answers = session.answers.count()
        correct_answers = session.answers.filter(is_correct=True).count()
        
        # Update session if all questions are answered
        if total_answers >= session.total_questions:
            session.correct_answers = correct_answers
            if session.total_questions > 0:
                session.score = (correct_answers / session.total_questions) * 100
            session.save(update_fields=['correct_answers', 'score'])

@receiver(post_save, sender=QuizSession)
def update_user_progress_on_completion(sender, instance, **kwargs):
    """
    Update user progress when a quiz session is completed
    """
    if instance.status == 'completed':
        from apps.users.models import UserProgress
        
        progress, created = UserProgress.objects.get_or_create(user=instance.user)
        
        # Recalculate total progress
        completed_sessions = QuizSession.objects.filter(
            user=instance.user,
            status='completed'
        )
        
        total_questions = sum(session.total_questions for session in completed_sessions)
        correct_answers = sum(session.correct_answers for session in completed_sessions)
        total_time = sum(session.time_spent_seconds for session in completed_sessions)
        
        progress.total_questions_attempted = total_questions
        progress.correct_answers = correct_answers
        progress.total_study_time = timedelta(seconds=total_time)
        progress.save()