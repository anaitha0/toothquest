# apps/students/admin.py
from django.contrib import admin
from .models import (
    Quiz, QuizQuestion, QuizSession, QuizAnswer,
    StudentCalendarEvent, StudentNote, StudentPreference
)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'module_name', 'year', 'difficulty', 'questions_count', 'status', 'created_at']
    list_filter = ['module_name', 'year', 'difficulty', 'status', 'is_public']
    search_fields = ['title', 'description', 'module_name', 'course_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'module_name', 'course_name')
        }),
        ('Configuration', {
            'fields': ('year', 'difficulty', 'time_limit_minutes', 'questions_count', 'passing_score')
        }),
        ('Status', {
            'fields': ('status', 'is_public', 'created_by')
        }),
    )

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'question', 'order', 'points']
    list_filter = ['quiz__module_name', 'quiz__year']
    ordering = ['quiz', 'order']

@admin.register(QuizSession)
class QuizSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'status', 'score', 'started_at', 'completed_at']
    list_filter = ['status', 'quiz__module_name', 'started_at']
    search_fields = ['user__email', 'user__full_name', 'quiz__title']
    ordering = ['-started_at']
    
    readonly_fields = ['started_at', 'expires_at', 'percentage_score']
    
    def percentage_score(self, obj):
        return f"{obj.percentage_score:.1f}%" if obj.percentage_score else "N/A"
    percentage_score.short_description = 'Score %'

@admin.register(QuizAnswer)
class QuizAnswerAdmin(admin.ModelAdmin):
    list_display = ['quiz_session', 'question_short', 'selected_option', 'is_correct', 'flagged']
    list_filter = ['is_correct', 'flagged', 'selected_option']
    search_fields = ['quiz_session__user__email', 'question__question_text']
    
    def question_short(self, obj):
        return obj.question.question_text[:50] + '...'
    question_short.short_description = 'Question'

@admin.register(StudentCalendarEvent)
class StudentCalendarEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'event_type', 'event_date', 'priority', 'is_completed']
    list_filter = ['event_type', 'priority', 'is_completed', 'event_date']
    search_fields = ['title', 'description', 'user__email', 'user__full_name']
    ordering = ['-event_date']
    
    fieldsets = (
        ('Event Details', {
            'fields': ('user', 'title', 'description', 'event_type')
        }),
        ('Schedule', {
            'fields': ('event_date', 'location')
        }),
        ('Settings', {
            'fields': ('priority', 'is_completed', 'reminder_enabled', 'color')
        }),
        ('Tags', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
    )

@admin.register(StudentNote)
class StudentNoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'module_name', 'is_favorite', 'created_at']
    list_filter = ['module_name', 'is_favorite', 'created_at']
    search_fields = ['title', 'content', 'user__email', 'user__full_name']
    ordering = ['-updated_at']

@admin.register(StudentPreference)
class StudentPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'preferred_study_time', 'difficulty_preference', 'daily_study_goal_minutes']
    list_filter = ['preferred_study_time', 'difficulty_preference', 'theme_preference']
    search_fields = ['user__email', 'user__full_name']