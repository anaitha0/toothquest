from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token  # Fix this import
from apps.users.models import UserProgress
from apps.core.tasks import send_welcome_email, send_account_activation_email

User = get_user_model()

@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """
    Create authentication token for new users
    """
    if created:
        Token.objects.create(user=instance)

@receiver(post_save, sender=User)
def create_user_progress(sender, instance=None, created=False, **kwargs):
    """
    Create user progress record for new students
    """
    if created and instance.role == 'student':
        UserProgress.objects.create(user=instance)

@receiver(post_save, sender=User)
def send_welcome_email_on_creation(sender, instance=None, created=False, **kwargs):
    """
    Send welcome email when new user is created
    """
    if created and instance.role == 'student':
        # Use Celery task to send email asynchronously
        send_welcome_email.delay(instance.id)

@receiver(post_save, sender=User)
def send_activation_email(sender, instance=None, created=False, **kwargs):
    """
    Send activation email when user status changes to active
    """
    if not created and instance.role == 'student':
        # Check if status was changed to active
        if instance.status == 'active':
            old_instance = User.objects.get(pk=instance.pk)
            if hasattr(old_instance, '_state') and old_instance.status != 'active':
                send_account_activation_email.delay(instance.id)