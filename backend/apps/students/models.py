# apps/students/models.py
from django.db import models
from apps.core.models import TimeStampedModel, DifficultyChoices, YearChoices
from apps.authentication.models import User
from apps.questions.models import Question

class Quiz(TimeStampedModel):
    QUIZ_STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    module_name = models.CharField(max_length=100)
    course_name = models.CharField(max_length=100, blank=True)
    year = models.IntegerField(choices=YearChoices.choices)
    difficulty = models.CharField(max_length=10, choices=DifficultyChoices.choices)
    time_limit_minutes = models.IntegerField(default=30)
    questions_count = models.IntegerField(default=20)
    passing_score = models.IntegerField(default=70)  # Percentage
    status = models.CharField(max_length=20, choices=QUIZ_STATUS_CHOICES, default='active')
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    
    def __str__(self):
        return self.title

class QuizQuestion(TimeStampedModel):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='quiz_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    points = models.IntegerField(default=1)
    
    class Meta:
        unique_together = ['quiz', 'question']
        ordering = ['order']

class QuizSession(TimeStampedModel):
    SESSION_STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('abandoned', 'Abandoned'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_sessions')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='sessions')
    status = models.CharField(max_length=20, choices=SESSION_STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.email} - {self.quiz.title}"
    
    @property
    def percentage_score(self):
        if self.total_questions > 0:
            return (self.correct_answers / self.total_questions) * 100
        return 0

class QuizAnswer(TimeStampedModel):
    quiz_session = models.ForeignKey(QuizSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')])
    is_correct = models.BooleanField()
    time_taken_seconds = models.IntegerField(default=0)
    flagged = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['quiz_session', 'question']

class StudentCalendarEvent(TimeStampedModel):
    EVENT_TYPES = (
        ('exam', 'Exam'),
        ('quiz', 'Quiz'),
        ('study', 'Study Session'),
        ('assignment', 'Assignment'),
        ('reminder', 'Reminder'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    event_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_completed = models.BooleanField(default=False)
    reminder_enabled = models.BooleanField(default=True)
    tags = models.JSONField(default=list, blank=True)
    color = models.CharField(max_length=7, blank=True)  # Hex color
    
    def __str__(self):
        return f"{self.title} - {self.event_date.strftime('%Y-%m-%d %H:%M')}"

class StudentNote(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=200)
    content = models.TextField()
    module_name = models.CharField(max_length=100, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_favorite = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title

class StudentPreference(TimeStampedModel):
    STUDY_TIME_CHOICES = (
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
        ('night', 'Night'),
    )
    
    DIFFICULTY_PREFERENCE_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_preferences')
    preferred_study_time = models.CharField(max_length=20, choices=STUDY_TIME_CHOICES, default='morning')
    daily_study_goal_minutes = models.IntegerField(default=120)  # 2 hours
    difficulty_preference = models.CharField(max_length=20, choices=DIFFICULTY_PREFERENCE_CHOICES, default='intermediate')
    favorite_modules = models.JSONField(default=list, blank=True)
    reminder_frequency = models.CharField(max_length=20, default='daily')
    theme_preference = models.CharField(max_length=20, default='light')
    notification_enabled = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.email} preferences"