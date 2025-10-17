from django.contrib import admin
from .models import Module, Course, Question, QuestionOption, QuestionReport

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'year', 'is_active', 'created_at']
    list_filter = ['year', 'is_active']
    search_fields = ['name']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'module', 'created_at']
    list_filter = ['module', 'module__year']
    search_fields = ['name', 'module__name']

class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 4
    max_num = 4

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    # CORRECTED: Referencing 'module_name' and 'course_name' (CharField attributes)
    list_display = ['question_text_short', 'module_name', 'course_name', 'year', 'difficulty', 'is_active', 'created_at']
    # CORRECTED: Filtering by 'module_name' and 'course_name' (CharField attributes)
    list_filter = ['module_name', 'course_name', 'year', 'difficulty', 'is_active', 'created_at']
    # CORRECTED: Added 'module_name' and 'course_name' to search fields
    search_fields = ['question_text', 'explanation', 'module_name', 'course_name']
    inlines = [QuestionOptionInline]
    
    def question_text_short(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Question'

@admin.register(QuestionReport)
class QuestionReportAdmin(admin.ModelAdmin):
    list_display = ['question_short', 'reported_by', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    # Corrected search fields to use related string fields for question
    search_fields = ['question__question_text', 'reported_by__email', 'reason', 'question__module_name', 'question__course_name']
    
    def question_short(self, obj):
        return obj.question.question_text[:30] + '...'
    question_short.short_description = 'Question'