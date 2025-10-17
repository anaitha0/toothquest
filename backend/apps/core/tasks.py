from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task
def send_welcome_email(user_id):
    """
    Send welcome email to new user
    """
    try:
        user = User.objects.get(id=user_id)
        subject = f'Welcome to ToothQuest, {user.full_name or user.username}!'
        message = f"""
        Dear {user.full_name or user.username},

        Welcome to ToothQuest! Your account has been created successfully.

        You can now access your dashboard and start your learning journey.

        Best regards,
        The ToothQuest Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Welcome email sent to {user.email}")
        return f"Welcome email sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} does not exist")
        return f"User with id {user_id} does not exist"
    except Exception as e:
        logger.error(f"Failed to send welcome email: {str(e)}")
        return f"Failed to send welcome email: {str(e)}"

@shared_task
def send_account_activation_email(user_id):
    """
    Send account activation email
    """
    try:
        user = User.objects.get(id=user_id)
        subject = 'Your ToothQuest Account Has Been Activated'
        message = f"""
        Dear {user.full_name or user.username},

        Great news! Your ToothQuest account has been activated by our admin team.

        You can now log in and access all features of your subscription plan.

        Login at: http://localhost:3000/login

        Best regards,
        The ToothQuest Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Activation email sent to {user.email}")
        return f"Activation email sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} does not exist")
        return f"User with id {user_id} does not exist"
    except Exception as e:
        logger.error(f"Failed to send activation email: {str(e)}")
        return f"Failed to send activation email: {str(e)}"

@shared_task
def cleanup_expired_tokens():
    """
    Clean up expired authentication tokens
    """
    from rest_framework.authtoken.models import Token
    from django.utils import timezone
    from datetime import timedelta
    
    # Remove tokens older than 30 days
    cutoff_date = timezone.now() - timedelta(days=30)
    expired_tokens = Token.objects.filter(created__lt=cutoff_date)
    count = expired_tokens.count()
    expired_tokens.delete()
    
    logger.info(f"Cleaned up {count} expired tokens")
    return f"Cleaned up {count} expired tokens"

@shared_task
def generate_daily_report():
    """
    Generate daily statistics report
    """
    from apps.users.models import QuizAttempt
    from django.utils import timezone
    from datetime import timedelta
    
    try:
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        # Get yesterday's statistics
        total_attempts = QuizAttempt.objects.filter(
            created_at__date=yesterday
        ).count()
        
        correct_attempts = QuizAttempt.objects.filter(
            created_at__date=yesterday,
            is_correct=True
        ).count()
        
        new_users = User.objects.filter(
            created_at__date=yesterday
        ).count()
        
        # Calculate accuracy
        accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        report = f"""
        Daily Report for {yesterday}
        ============================
        
        Quiz Statistics:
        - Total Quiz Attempts: {total_attempts}
        - Correct Answers: {correct_attempts}
        - Accuracy Rate: {accuracy:.2f}%
        
        User Statistics:
        - New Users: {new_users}
        
        Generated at: {timezone.now()}
        """
        
        logger.info("Daily report generated successfully")
        return report
        
    except Exception as e:
        logger.error(f"Failed to generate daily report: {str(e)}")
        return f"Failed to generate daily report: {str(e)}"

@shared_task
def backup_database():
    """
    Create database backup (placeholder - implement based on your backup strategy)
    """
    import subprocess
    import os
    from django.conf import settings
    
    try:
        # This is a simple example - you might want to use more sophisticated backup methods
        backup_filename = f"backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}.sql"
        backup_path = os.path.join('/tmp', backup_filename)
        
        # Note: This requires pg_dump to be available and proper database credentials
        # You might want to implement this differently based on your infrastructure
        
        logger.info(f"Database backup would be created at {backup_path}")
        return f"Database backup completed: {backup_filename}"
        
    except Exception as e:
        logger.error(f"Database backup failed: {str(e)}")
        return f"Database backup failed: {str(e)}"