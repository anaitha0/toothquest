# models.py
from django.db import models
from apps.core.models import TimeStampedModel, DifficultyChoices, YearChoices
from apps.authentication.models import User

class Module(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    year = models.IntegerField(choices=YearChoices.choices)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Course(TimeStampedModel):
    name = models.CharField(max_length=100)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='courses')
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.module.name} - {self.name}"

class Question(TimeStampedModel):
    question_text = models.TextField()
    # Changed to string fields instead of foreign keys
    module_name = models.CharField(max_length=100)
    course_name = models.CharField(max_length=100)
    year = models.IntegerField(choices=YearChoices.choices)
    difficulty = models.CharField(max_length=10, choices=DifficultyChoices.choices)
    explanation = models.TextField()
    image = models.ImageField(upload_to='questions/', null=True, blank=True)
    explanation_image = models.ImageField(upload_to='questions/explanations/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_questions')
    
    def __str__(self):
        return f"{self.question_text[:50]}..."
    
    @property
    def has_image(self):
        return bool(self.image)

class QuestionOption(TimeStampedModel):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.TextField()
    option_letter = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')])
    is_correct = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['question', 'option_letter']
    
    def __str__(self):
        return f"{self.question.id} - {self.option_letter}: {self.option_text[:30]}..."

class QuestionReport(TimeStampedModel):
    REPORT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='question_reports')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=REPORT_STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_reports')
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Report for Question {self.question.id} by {self.reported_by.email}"