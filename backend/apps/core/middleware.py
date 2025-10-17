import logging
from django.utils import timezone
from apps.users.models import UserActivity
from apps.core.utils import get_client_ip

logger = logging.getLogger(__name__)

class ActivityTrackingMiddleware:
    """
    Middleware to track user activities
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Track activity for authenticated users
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'DELETE']:
            try:
                # Determine action based on URL and method
                action = self.get_action_from_request(request)
                if action:
                    UserActivity.objects.create(
                        user=request.user,
                        action=action,
                        details=f"{request.method} {request.path}",
                        ip_address=get_client_ip(request)
                    )
            except Exception as e:
                logger.error(f"Failed to track user activity: {e}")
        
        return response
    
    def get_action_from_request(self, request):
        """
        Determine action type from request
        """
        path = request.path.lower()
        method = request.method
        
        if 'login' in path and method == 'POST':
            return 'User Login'
        elif 'logout' in path and method == 'POST':
            return 'User Logout'
        elif 'questions' in path and method == 'POST':
            return 'Question Created'
        elif 'questions' in path and method == 'PUT':
            return 'Question Updated'
        elif 'questions' in path and method == 'DELETE':
            return 'Question Deleted'
        elif 'users' in path and method == 'POST':
            return 'User Created'
        elif 'users' in path and method == 'PUT':
            return 'User Updated'
        elif 'users' in path and method == 'DELETE':
            return 'User Deleted'
        elif 'access-codes' in path and method == 'POST':
            return 'Access Code Generated'
        elif 'reports' in path and 'resolve' in path and method == 'POST':
            return 'Report Resolved'
        elif 'reports' in path and 'dismiss' in path and method == 'POST':
            return 'Report Dismissed'
        
        return None

class CorsMiddleware:
    """
    Simple CORS middleware for development
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add CORS headers for development
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response

class APILoggingMiddleware:
    """
    Middleware to log API requests
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = timezone.now()
        
        response = self.get_response(request)
        
        end_time = timezone.now()
        duration = (end_time - start_time).total_seconds()
        
        # Log API requests
        if request.path.startswith('/api/'):
            logger.info(
                f"{request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {duration:.3f}s - "
                f"User: {request.user if request.user.is_authenticated else 'Anonymous'}"
            )
        
        return response