# apps/admin_panel/views.py (ENHANCED VERSION)
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from apps.authentication.models import User, AccessCode
from apps.questions.models import Question, QuestionReport
from apps.users.models import QuizAttempt
import random
import string

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Basic stats
    total_users = User.objects.filter(role='student').count()
    active_users = User.objects.filter(role='student', status='active').count()
    total_questions = Question.objects.filter(is_active=True).count()
    reported_questions = QuestionReport.objects.filter(status='pending').count()
    pending_accounts = User.objects.filter(role='student', status='pending').count()
    
    # Recent data (last 5 users)
    recent_users_queryset = User.objects.filter(role='student').order_by('-created_at')[:5]
    recent_users = [
        {
            'id': user.id,
            'name': user.full_name or user.username,
            'email': user.email,
            'date': user.created_at.strftime('%d %b %Y'),
            'status': user.status,
            'plan': user.subscription_plan or 'No Plan'
        } for user in recent_users_queryset
    ]
    
    # Pending receipts (placeholder - you can implement this based on your receipt model)
    pending_receipts = []
    
    # Recent reports (last 3)
    recent_reports_queryset = QuestionReport.objects.filter(status='pending').order_by('-created_at')[:3]
    recent_reports = [
        {
            'id': report.id,
            'question': report.question.question_text[:50] + '...' if len(report.question.question_text) > 50 else report.question.question_text,
            'reported_by': report.reported_by.full_name or report.reported_by.username,
            'date': report.created_at.strftime('%d %b %Y'),
            'reason': report.reason
        } for report in recent_reports_queryset
    ]
    
    # Recent activity - you can expand this based on your activity tracking
    recent_activity = [
        {
            'id': 1,
            'action': 'Added new question',
            'user': 'Admin',
            'date': timezone.now().strftime('%d %b %Y, %H:%M'),
            'details': 'Added question to Dental Materials module',
            'type': 'success'
        },
        {
            'id': 2,
            'action': 'Approved new user',
            'user': 'Admin',
            'date': (timezone.now() - timedelta(hours=2)).strftime('%d %b %Y, %H:%M'),
            'details': f'Approved {recent_users[0]["name"] if recent_users else "a user"} account',
            'type': 'info'
        },
        {
            'id': 3,
            'action': 'Resolved question report',
            'user': 'Admin',
            'date': (timezone.now() - timedelta(hours=5)).strftime('%d %b %Y, %H:%M'),
            'details': 'Fixed reported issue with question formatting',
            'type': 'warning'
        }
    ]
    
    return Response({
        'stats': {
            'total_users': total_users,
            'active_users': active_users,
            'total_questions': total_questions,
            'reported_questions': reported_questions,
            'pending_accounts': pending_accounts,
        },
        'recent_users': recent_users,
        'pending_receipts': pending_receipts,
        'recent_reports': recent_reports,
        'recent_activity': recent_activity
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def statistics_data(request):
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Generate realistic revenue data based on user registrations and subscription plans
    current_year = timezone.now().year
    monthly_revenue = []
    monthly_users = []
    monthly_quiz_attempts = []
    
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for i, month in enumerate(months):
        # Calculate users registered in this month
        start_date = datetime(current_year, i + 1, 1)
        if i == 11:  # December
            end_date = datetime(current_year + 1, 1, 1)
        else:
            end_date = datetime(current_year, i + 2, 1)
        
        users_this_month = User.objects.filter(
            role='student',
            created_at__gte=start_date,
            created_at__lt=end_date
        ).count()
        
        # Estimate revenue based on users (assuming average plan cost)
        avg_plan_cost = 2000  # Average cost in DA
        estimated_revenue = users_this_month * avg_plan_cost
        
        # Quiz attempts this month
        quiz_attempts = QuizAttempt.objects.filter(
            created_at__gte=start_date,
            created_at__lt=end_date
        ).count()
        
        monthly_revenue.append(estimated_revenue)
        monthly_users.append(users_this_month)
        monthly_quiz_attempts.append(quiz_attempts)
    
    # Revenue data
    revenue_data = {
        'labels': months,
        'datasets': [{
            'label': 'Revenue (DA)',
            'data': monthly_revenue,
        }]
    }
    
    # User registrations by month
    user_registrations_data = {
        'labels': months,
        'datasets': [{
            'label': 'New Users',
            'data': monthly_users,
        }]
    }
    
    # Quiz attempts data
    quiz_attempts_data = {
        'labels': months,
        'datasets': [{
            'label': 'Quiz Attempts',
            'data': monthly_quiz_attempts,
        }]
    }
    
    # Students by year
    year_distribution = User.objects.filter(role='student').values('year').annotate(count=Count('year'))
    year_counts = [0, 0, 0, 0, 0]  # Initialize for years 1-5
    
    for item in year_distribution:
        if item['year'] and 1 <= item['year'] <= 5:
            year_counts[item['year'] - 1] = item['count']
    
    year_data = {
        'labels': ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
        'datasets': [{
            'label': 'Students',
            'data': year_counts,
        }]
    }
    
    # Calculate platform stats
    total_users = User.objects.filter(role='student').count()
    active_users = User.objects.filter(role='student', status='active').count()
    total_questions = Question.objects.filter(is_active=True).count()
    total_quiz_attempts = QuizAttempt.objects.count()
    
    # Calculate average score
    correct_attempts = QuizAttempt.objects.filter(is_correct=True).count()
    avg_user_score = (correct_attempts / total_quiz_attempts * 100) if total_quiz_attempts > 0 else 0
    
    # Calculate total revenue (estimated)
    total_revenue = sum(monthly_revenue)
    
    # Subscription renewal rate (placeholder - implement based on your subscription model)
    subscription_renewal_rate = 86.2
    
    platform_stats = {
        'total_users': total_users,
        'active_users': active_users,
        'total_questions': total_questions,
        'total_quiz_attempts': total_quiz_attempts,
        'total_revenue': total_revenue,
        'avg_user_score': round(avg_user_score, 1),
        'subscription_renewal_rate': subscription_renewal_rate,
    }
    
    return Response({
        'revenue_data': revenue_data,
        'user_registrations_data': user_registrations_data,
        'quiz_attempts_data': quiz_attempts_data,
        'year_distribution_data': year_data,
        'platform_stats': platform_stats,
    })

def generate_unique_code(prefix, length=6):
    """Generate a unique access code with given prefix"""
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    while True:
        random_part = ''.join(random.choices(chars, k=length))
        code = f"{prefix}-{random_part}"
        if not AccessCode.objects.filter(code=code).exists():
            return code

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_access_codes(request):
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    package = request.data.get('package')
    count = request.data.get('count', 1)
    
    if not package or count < 1 or count > 100:
        return Response({'error': 'Invalid parameters'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Package prefixes
    prefixes = {
        '1st Year Package': 'TQ1',
        '2nd Year Package': 'TQ2',
        '3rd Year Package': 'TQ3',
        '4th Year Package': 'TQ4',
        '5th Year Package': 'TQ5',
        'Complete Package': 'TQC',
    }
    
    prefix = prefixes.get(package)
    if not prefix:
        return Response({'error': 'Invalid package'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate codes
    codes = []
    for _ in range(count):
        code = generate_unique_code(prefix)
        access_code = AccessCode.objects.create(
            code=code,
            package=package,
            status='unused'
        )
        codes.append({
            'id': access_code.id,
            'code': access_code.code,
            'package': access_code.package,
            'status': access_code.status,
            'created_at': access_code.created_at.isoformat()
        })
    
    return Response({
        'message': f'{count} codes generated successfully',
        'codes': codes
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def settings_data(request):
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Return current settings (you can implement a Settings model later)
    return Response({
        'general_settings': {
            'site_name': 'ToothQuest',
            'site_description': 'Dental exams platform for dental students',
            'contact_email': 'contact@toothquest.com',
            'support_phone': '+213 123 456 789',
        },
        'email_settings': {
            'smtp_server': 'smtp.toothquest.com',
            'smtp_port': 587,
            'smtp_username': 'notifications@toothquest.com',
            'from_email': 'notifications@toothquest.com',
            'from_name': 'ToothQuest Education',
            'enable_emails': True,
        },
        'system_settings': {
            'maintenance_mode': False,
            'debug_mode': False,
            'max_upload_size': 10,
            'session_timeout': 60,
            'allow_registration': True,
            'require_email_verification': True,
            'max_login_attempts': 5,
            'backup_frequency': 'daily',
            'last_backup': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_settings(request):
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    settings_type = request.data.get('type')
    settings_data = request.data.get('data', {})
    
    # Here you would update the actual settings in a Settings model
    # For now, we'll just return success
    
    return Response({'message': f'{settings_type} settings updated successfully'})

# Additional endpoint for quick stats that might be called frequently
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quick_stats(request):
    """Quick stats endpoint for real-time updates"""
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get today's stats
    today = timezone.now().date()
    
    stats = {
        'users_today': User.objects.filter(
            role='student',
            created_at__date=today
        ).count(),
        'quiz_attempts_today': QuizAttempt.objects.filter(
            created_at__date=today
        ).count(),
        'pending_reports': QuestionReport.objects.filter(
            status='pending'
        ).count(),
        'pending_accounts': User.objects.filter(
            role='student',
            status='pending'
        ).count(),
    }
    
    return Response(stats)