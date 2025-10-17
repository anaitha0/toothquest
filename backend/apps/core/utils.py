import uuid
import os
from django.utils.text import slugify
from django.core.mail import send_mail
from django.conf import settings
import random
import string

def generate_unique_filename(instance, filename):
    """
    Generate a unique filename for uploaded files
    """
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    
    # Get the model name to create organized folders
    model_name = instance.__class__.__name__.lower()
    
    return os.path.join('uploads', model_name, filename)

def generate_access_code(prefix='TQ', length=6):
    """
    Generate a random access code with given prefix and length
    """
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choices(chars, k=length))
    return f"{prefix}-{random_part}"

def send_notification_email(to_email, subject, message, html_message=None):
    """
    Send notification email
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

def create_slug(text):
    """
    Create a URL-friendly slug from text
    """
    return slugify(text)

def calculate_percentage(part, whole):
    """
    Calculate percentage with proper handling of zero division
    """
    if whole == 0:
        return 0
    return round((part / whole) * 100, 2)

def format_duration(seconds):
    """
    Format duration in seconds to readable format
    """
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        return f"{hours}h {remaining_minutes}m"

def get_client_ip(request):
    """
    Get client IP address from request
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip