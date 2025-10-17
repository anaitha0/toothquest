
from django.contrib import admin
from .models import UserActivity, QuizAttempt, UserProgress

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__email', 'action', 'details']

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'question_short', 'selected_option', 'is_correct', 'created_at']
    list_filter = ['is_correct', 'created_at']
    search_fields = ['user__email', 'question__question_text']
    
    def question_short(self, obj):
        return obj.question.question_text[:30] + '...'
    question_short.short_description = 'Question'

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_questions_attempted', 'correct_answers', 'accuracy_percentage']
    search_fields = ['user__email']