# apps/authentication/models.py (COMPLETE FILE)
from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import TimeStampedModel, StatusChoices, YearChoices

class User(AbstractUser, TimeStampedModel):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('super_admin', 'Super Admin'),
        ('moderator', 'Moderator'),
        ('viewer', 'Viewer'),
    )
    
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    university = models.CharField(max_length=255, blank=True)
    year = models.IntegerField(choices=YearChoices.choices, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    subscription_plan = models.CharField(max_length=50, blank=True)
    subscription_expiry = models.DateTimeField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
    @property
    def is_admin(self):
        """Check if user has admin privileges"""
        admin_roles = ['admin', 'super_admin', 'moderator']
        return self.role in admin_roles
    
    @property
    def is_student(self):
        """Check if user is a student"""
        return self.role == 'student'
    
    @property
    def is_super_admin(self):
        """Check if user is a super admin"""
        return self.role == 'super_admin'


class AdminAccount(TimeStampedModel):
    ADMIN_ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('viewer', 'Viewer'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ADMIN_ROLE_CHOICES)
    permissions = models.JSONField(default=list)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_admins')
    last_login = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.role}"


class AccessCode(TimeStampedModel):
    CODE_STATUS_CHOICES = (
        ('unused', 'Unused'),
        ('used', 'Used'),
        ('expired', 'Expired'),
    )
    
    code = models.CharField(max_length=20, unique=True, db_index=True)
    package = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=CODE_STATUS_CHOICES, default='unused')
    used_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    used_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.code