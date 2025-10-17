# Subscription Plans
SUBSCRIPTION_PLANS = {
    '1st Year Package': {
        'name': '1st Year Package',
        'price': 1200,  # DZD
        'prefix': 'TQ1',
        'description': 'Complete package for 1st year dental students',
        'duration_months': 12,
    },
    '2nd Year Package': {
        'name': '2nd Year Package', 
        'price': 1800,
        'prefix': 'TQ2',
        'description': 'Complete package for 2nd year dental students',
        'duration_months': 12,
    },
    '3rd Year Package': {
        'name': '3rd Year Package',
        'price': 2000,
        'prefix': 'TQ3', 
        'description': 'Complete package for 3rd year dental students',
        'duration_months': 12,
    },
    '4th Year Package': {
        'name': '4th Year Package',
        'price': 2200,
        'prefix': 'TQ4',
        'description': 'Complete package for 4th year dental students', 
        'duration_months': 12,
    },
    '5th Year Package': {
        'name': '5th Year Package',
        'price': 2500,
        'prefix': 'TQ5',
        'description': 'Complete package for 5th year dental students',
        'duration_months': 12,
    },
    'Complete Package': {
        'name': 'Complete Package',
        'price': 4500,
        'prefix': 'TQC',
        'description': 'Complete access to all years and modules',
        'duration_months': 12,
    }
}

# Question Difficulty Levels
DIFFICULTY_LEVELS = {
    'easy': {
        'name': 'Easy',
        'color': '#10B981',  # Green
        'points': 1,
    },
    'medium': {
        'name': 'Medium', 
        'color': '#F59E0B',  # Yellow
        'points': 2,
    },
    'hard': {
        'name': 'Hard',
        'color': '#EF4444',  # Red
        'points': 3,
    }
}

# Dental School Years
DENTAL_YEARS = {
    1: '1st Year',
    2: '2nd Year', 
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year',
}

# User Statuses
USER_STATUSES = {
    'active': {
        'name': 'Active',
        'color': '#10B981',  # Green
        'description': 'User has full access to platform',
    },
    'pending': {
        'name': 'Pending',
        'color': '#F59E0B',  # Yellow  
        'description': 'User registration pending approval',
    },
    'inactive': {
        'name': 'Inactive',
        'color': '#6B7280',  # Gray
        'description': 'User account is inactive',
    },
    'blocked': {
        'name': 'Blocked',
        'color': '#EF4444',  # Red
        'description': 'User account is blocked',
    },
    'suspended': {
        'name': 'Suspended',
        'color': '#DC2626',  # Dark Red
        'description': 'User account is temporarily suspended',
    }
}

# Admin Roles and Permissions
ADMIN_PERMISSIONS = {
    'users.view': 'View Users',
    'users.create': 'Create Users',
    'users.edit': 'Edit Users', 
    'users.delete': 'Delete Users',
    'users.suspend': 'Suspend Users',
    
    'questions.view': 'View Questions',
    'questions.create': 'Create Questions',
    'questions.edit': 'Edit Questions',
    'questions.delete': 'Delete Questions',
    'questions.moderate': 'Moderate Questions',
    
    'codes.view': 'View Access Codes',
    'codes.generate': 'Generate Access Codes',
    'codes.download': 'Download Access Codes',
    'codes.revoke': 'Revoke Access Codes',
    
    'stats.view': 'View Statistics',
    'stats.export': 'Export Statistics',
    'stats.detailed': 'Detailed Analytics',
    
    'system.settings': 'System Settings',
    'system.backup': 'System Backup',
    'system.logs': 'View System Logs',
    'admins.manage': 'Manage Admin Accounts',
}

ROLE_PERMISSIONS = {
    'super_admin': list(ADMIN_PERMISSIONS.keys()),  # All permissions
    'admin': [
        'users.view', 'users.create', 'users.edit', 'users.suspend',
        'questions.view', 'questions.create', 'questions.edit', 'questions.moderate',
        'codes.view', 'codes.generate', 'codes.download',
        'stats.view', 'stats.export',
    ],
    'moderator': [
        'users.view', 'users.suspend',
        'questions.view', 'questions.moderate',
        'codes.view',
        'stats.view',
    ],
    'viewer': [
        'users.view',
        'questions.view', 
        'codes.view',
        'stats.view',
    ],
}

# Algerian Universities (for validation)
ALGERIAN_UNIVERSITIES = [
    'University of Algiers 1',
    'University of Algiers 2',
    'University of Algiers 3',
    'University of Constantine 1',
    'University of Constantine 2', 
    'University of Constantine 3',
    'University of Oran 1',
    'University of Oran 2',
    'University of Annaba',
    'University of Blida 1',
    'University of Blida 2',
    'University of Batna 1',
    'University of Batna 2',
    'University of Setif 1',
    'University of Setif 2',
    'University of Tlemcen',
    'University of Bejaia',
    'University of Tizi Ouzou',
    'University of Sidi Bel Abbes',
    'University of Mostaganem',
    'University of Boumerdes',
    'University of M\'Sila',
    'University of Ouargla',
    'University of Biskra',
    'University of Jijel',
    'University of Skikda',
    'University of Guelma',
    'University of Souk Ahras',
    'University of Khenchela',
    'University of Oum El Bouaghi',
    'University of Laghouat',
    'University of Djelfa',
    'University of Tiaret',
    'University of Saida',
    'University of Mascara',
    'University of Relizane',
    'University of El Tarf',
    'University of Bordj Bou Arreridj',
    'University of El Oued',
    'University of Ghardaia',
    'University of Chlef',
    'University of Medea',
    'University of Bouira',
    'University of Ain Temouchent',
    'University of Ain Defla',
    'University of Naama',
    'University of Mila',
    'University of Tissemsilt',
    'University of El Bayadh',
    'University of Illizi',
]

# Email Templates
EMAIL_TEMPLATES = {
    'welcome': {
        'subject': 'Welcome to ToothQuest!',
        'template': 'emails/welcome.html',
    },
    'activation': {
        'subject': 'Your ToothQuest Account Has Been Activated',
        'template': 'emails/activation.html',
    },
    'password_reset': {
        'subject': 'Reset Your ToothQuest Password',
        'template': 'emails/password_reset.html',
    },
    'subscription_expiry': {
        'subject': 'Your ToothQuest Subscription is Expiring Soon',
        'template': 'emails/subscription_expiry.html',
    },
    'report_resolved': {
        'subject': 'Your Question Report Has Been Resolved',
        'template': 'emails/report_resolved.html',
    },
    'admin_created': {
        'subject': 'New Admin Account Created',
        'template': 'emails/admin_created.html',
    },
    'quiz_completed': {
        'subject': 'Quiz Completed - Results Available',
        'template': 'emails/quiz_completed.html',
    },
    'monthly_report': {
        'subject': 'Your Monthly Progress Report',
        'template': 'emails/monthly_report.html',
    }
}

# API Rate Limiting
RATE_LIMITS = {
    'login': '5/minute',
    'registration': '3/minute',
    'password_reset': '3/minute',
    'quiz_attempt': '100/hour',
    'question_report': '10/hour',
    'api_default': '1000/hour',
    'admin_actions': '200/hour',
    'file_upload': '20/hour',
}

# Cache Keys
CACHE_KEYS = {
    'user_stats': 'user_stats_{user_id}',
    'dashboard_stats': 'dashboard_stats',
    'question_count': 'question_count_{module_id}',
    'module_list': 'module_list',
    'popular_questions': 'popular_questions',
    'university_list': 'university_list',
    'subscription_plans': 'subscription_plans',
    'admin_permissions': 'admin_permissions',
}

# Cache Timeouts (in seconds)
CACHE_TIMEOUTS = {
    'dashboard_stats': 300,      # 5 minutes
    'user_stats': 600,           # 10 minutes
    'module_list': 3600,         # 1 hour
    'university_list': 86400,    # 24 hours
    'subscription_plans': 86400, # 24 hours
}

# File Upload Constraints
UPLOAD_CONSTRAINTS = {
    'question_image': {
        'max_size': 5 * 1024 * 1024,  # 5MB
        'allowed_types': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'max_width': 1920,
        'max_height': 1080,
        'min_width': 200,
        'min_height': 200,
    },
    'user_avatar': {
        'max_size': 2 * 1024 * 1024,  # 2MB
        'allowed_types': ['image/jpeg', 'image/png'],
        'max_width': 500,
        'max_height': 500,
        'min_width': 100,
        'min_height': 100,
    },
    'document': {
        'max_size': 10 * 1024 * 1024,  # 10MB
        'allowed_types': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    }
}

# Pagination Defaults
PAGINATION_SETTINGS = {
    'default_page_size': 20,
    'max_page_size': 100,
    'page_size_query_param': 'page_size',
}

# Quiz Settings
QUIZ_SETTINGS = {
    'default_questions_per_quiz': 20,
    'max_questions_per_quiz': 50,
    'min_questions_per_quiz': 5,
    'time_limit_minutes': 30,
    'passing_score_percentage': 60,
    'max_attempts_per_day': 5,
    'show_results_immediately': True,
    'allow_review_after_completion': True,
    'randomize_questions': True,
    'randomize_options': True,
}

# Notification Types
NOTIFICATION_TYPES = {
    'info': {
        'name': 'Information',
        'color': '#3B82F6',  # Blue
        'icon': 'info',
    },
    'success': {
        'name': 'Success',
        'color': '#10B981',  # Green
        'icon': 'check',
    },
    'warning': {
        'name': 'Warning', 
        'color': '#F59E0B',  # Yellow
        'icon': 'warning',
    },
    'error': {
        'name': 'Error',
        'color': '#EF4444',  # Red
        'icon': 'error',
    },
    'achievement': {
        'name': 'Achievement',
        'color': '#8B5CF6',  # Purple
        'icon': 'trophy',
    }
}

# Achievement Types
ACHIEVEMENT_TYPES = {
    'first_quiz': {
        'name': 'First Quiz Completed',
        'description': 'Complete your first quiz',
        'points': 10,
        'icon': 'play',
    },
    'perfect_score': {
        'name': 'Perfect Score',
        'description': 'Get 100% on a quiz',
        'points': 50,
        'icon': 'star',
    },
    'study_streak': {
        'name': 'Study Streak',
        'description': 'Study for 7 consecutive days',
        'points': 30,
        'icon': 'fire',
    },
    'question_master': {
        'name': 'Question Master',
        'description': 'Answer 1000 questions correctly',
        'points': 100,
        'icon': 'brain',
    },
    'module_expert': {
        'name': 'Module Expert',
        'description': 'Complete all questions in a module with 80%+ accuracy',
        'points': 75,
        'icon': 'graduation-cap',
    }
}

# System Settings Defaults
SYSTEM_DEFAULTS = {
    'maintenance_mode': False,
    'allow_registration': True,
    'require_email_verification': True,
    'max_login_attempts': 5,
    'session_timeout_minutes': 60,
    'backup_frequency': 'daily',
    'max_upload_size_mb': 10,
    'enable_notifications': True,
    'enable_achievements': True,
    'enable_analytics': True,
}

# Performance Monitoring
PERFORMANCE_METRICS = {
    'slow_query_threshold': 1.0,  # seconds
    'api_response_time_warning': 2.0,  # seconds
    'memory_usage_warning': 80,  # percentage
    'disk_usage_warning': 85,  # percentage
}

# Security Settings
SECURITY_SETTINGS = {
    'password_min_length': 8,
    'password_require_uppercase': True,
    'password_require_lowercase': True,
    'password_require_numbers': True,
    'password_require_symbols': False,
    'max_failed_login_attempts': 5,
    'account_lockout_duration_minutes': 30,
    'token_expiry_days': 30,
    'require_2fa_for_admins': False,
}

# Dental Modules Configuration
DENTAL_MODULES = {
    1: [  # 1st Year
        'Oral Anatomy',
        'Cariology',
        'Dental Materials Basics',
        'Oral Biology',
        'Dental Terminology'
    ],
    2: [  # 2nd Year
        'Periodontics',
        'Endodontics Basics',
        'Oral Pathology',
        'Dental Materials Advanced',
        'Oral Radiology'
    ],
    3: [  # 3rd Year
        'Prosthodontics',
        'Orthodontics',
        'Oral Surgery',
        'Endodontics Advanced',
        'Periodontal Therapy'
    ],
    4: [  # 4th Year
        'Clinical Dentistry',
        'Pediatric Dentistry',
        'Oral Medicine',
        'Dental Public Health',
        'Practice Management'
    ],
    5: [  # 5th Year
        'Advanced Clinical Practice',
        'Dental Specialties',
        'Research Methods',
        'Ethics in Dentistry',
        'Comprehensive Care'
    ]
}

# Study Recommendations
STUDY_RECOMMENDATIONS = {
    'beginner': {
        'questions_per_session': 10,
        'study_time_minutes': 20,
        'difficulty_progression': ['easy', 'medium'],
    },
    'intermediate': {
        'questions_per_session': 15,
        'study_time_minutes': 30,
        'difficulty_progression': ['easy', 'medium', 'hard'],
    },
    'advanced': {
        'questions_per_session': 25,
        'study_time_minutes': 45,
        'difficulty_progression': ['medium', 'hard'],
    }
}

# Analytics Tracking
ANALYTICS_EVENTS = {
    'user_login': 'User Login',
    'user_logout': 'User Logout',
    'quiz_started': 'Quiz Started',
    'quiz_completed': 'Quiz Completed',
    'question_answered': 'Question Answered',
    'module_completed': 'Module Completed',
    'subscription_purchased': 'Subscription Purchased',
    'report_submitted': 'Question Report Submitted',
    'achievement_earned': 'Achievement Earned',
}

# Export Formats
EXPORT_FORMATS = {
    'csv': {
        'name': 'CSV',
        'mime_type': 'text/csv',
        'extension': '.csv',
    },
    'excel': {
        'name': 'Excel',
        'mime_type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'extension': '.xlsx',
    },
    'pdf': {
        'name': 'PDF',
        'mime_type': 'application/pdf',
        'extension': '.pdf',
    },
    'json': {
        'name': 'JSON',
        'mime_type': 'application/json',
        'extension': '.json',
    }
}

# Time Zones (for Algerian users)
TIME_ZONES = {
    'Africa/Algiers': 'Algeria Time (CET)',
    'UTC': 'UTC',
}

# Language Codes
LANGUAGE_CODES = {
    'ar': 'Arabic',
    'fr': 'French',
    'en': 'English',
}

# Default Configuration
DEFAULT_CONFIG = {
    'site_name': 'ToothQuest',
    'site_description': 'Premier dental education platform for Algerian dental students',
    'contact_email': 'contact@toothquest.com',
    'support_email': 'support@toothquest.com',
    'admin_email': 'admin@toothquest.com',
    'default_language': 'en',
    'default_timezone': 'Africa/Algiers',
    'currency': 'DZD',
    'country': 'Algeria',
}