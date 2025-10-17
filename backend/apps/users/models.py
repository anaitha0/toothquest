from django.db import models
from apps.core.models import TimeStampedModel
from apps.authentication.models import User
from apps.questions.models import Question

class UserActivity(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=100)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.action}"

class QuizAttempt(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='attempts')
    selected_option = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')])
    is_correct = models.BooleanField()
    time_taken = models.DurationField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - Question {self.question.id}"

class UserProgress(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    total_questions_attempted = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    total_study_time = models.DurationField(null=True, blank=True)
    
    @property
    def accuracy_percentage(self):
        if self.total_questions_attempted > 0:
            return (self.correct_answers / self.total_questions_attempted) * 100
        return 0
    
    def __str__(self):
        return f"{self.user.email} Progress"