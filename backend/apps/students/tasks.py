# apps/students/tasks.py
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta

from backend.apps.authentication.models import User
from .models import QuizSession, StudentCalendarEvent
from .utils import check_session_expiry

@shared_task
def cleanup_expired_quiz_sessions():
    """
    Clean up expired quiz sessions
    """
    expired_count = check_session_expiry()
    return f"Cleaned up {expired_count} expired quiz sessions"

@shared_task
def send_calendar_reminders():
    """
    Send reminders for upcoming calendar events
    """
    # Get events that are 1 hour away
    reminder_time = timezone.now() + timedelta(hours=1)
    
    events = StudentCalendarEvent.objects.filter(
        event_date__gte=timezone.now(),
        event_date__lte=reminder_time,
        reminder_enabled=True,
        is_completed=False
    ).select_related('user')
    
    sent_count = 0
    for event in events:
        try:
            send_mail(
                subject=f'Reminder: {event.title}',
                message=f'''
                Hello {event.user.full_name or event.user.username},
                
                This is a reminder for your upcoming event:
                
                Title: {event.title}
                Date: {event.event_date.strftime('%Y-%m-%d %H:%M')}
                Location: {event.location or 'Not specified'}
                
                Best regards,
                ToothQuest Team
                ''',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[event.user.email],
                fail_silently=True,
            )
            sent_count += 1
        except Exception as e:
            print(f"Failed to send reminder to {event.user.email}: {e}")
    
    return f"Sent {sent_count} calendar reminders"

@shared_task
def update_student_statistics():
    """
    Update student statistics and progress tracking
    """
    from apps.users.models import UserProgress
    from django.db.models import Count, Avg, Sum
    
    # Update user progress for all students
    students = User.objects.filter(role='student')
    updated_count = 0
    
    for student in students:
        completed_sessions = QuizSession.objects.filter(
            user=student, 
            status='completed'
        )
        
        if completed_sessions.exists():
            total_questions = completed_sessions.aggregate(
                total=Sum('total_questions')
            )['total'] or 0
            
            correct_answers = completed_sessions.aggregate(
                total=Sum('correct_answers')
            )['total'] or 0
            
            total_time = completed_sessions.aggregate(
                total=Sum('time_spent_seconds')
            )['total'] or 0
            
            progress, created = UserProgress.objects.get_or_create(user=student)
            progress.total_questions_attempted = total_questions
            progress.correct_answers = correct_answers
            progress.total_study_time = timedelta(seconds=total_time)
            progress.save()
            
            updated_count += 1
    
    return f"Updated statistics for {updated_count} students"

@shared_task
def generate_quiz_recommendations():
    """
    Generate personalized quiz recommendations for active students
    """
    from django.contrib.auth import get_user_model
    from .utils import get_student_recommendations
    
    User = get_user_model()
    
    # Get active students who have logged in recently
    recent_cutoff = timezone.now() - timedelta(days=7)
    active_students = User.objects.filter(
        role='student',
        status='active',
        last_login__gte=recent_cutoff
    )
    
    recommendations_generated = 0
    
    for student in active_students:
        try:
            recommendations = get_student_recommendations(student)
            # Store recommendations in cache or send notifications
            # Implementation depends on your caching strategy
            recommendations_generated += 1
        except Exception as e:
            print(f"Failed to generate recommendations for {student.email}: {e}")
    
    return f"Generated recommendations for {recommendations_generated} students"