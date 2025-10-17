from django.db import models
from django.utils import timezone

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class StatusChoices(models.TextChoices):
    ACTIVE = 'active', 'Active'
    INACTIVE = 'inactive', 'Inactive'
    PENDING = 'pending', 'Pending'
    BLOCKED = 'blocked', 'Blocked'
    SUSPENDED = 'suspended', 'Suspended'

class DifficultyChoices(models.TextChoices):
    EASY = 'easy', 'Easy'
    MEDIUM = 'medium', 'Medium'
    HARD = 'hard', 'Hard'

class YearChoices(models.IntegerChoices):
    FIRST = 1, '1st Year'
    SECOND = 2, '2nd Year'
    THIRD = 3, '3rd Year'
    FOURTH = 4, '4th Year'
    FIFTH = 5, '5th Year'