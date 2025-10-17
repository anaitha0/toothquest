# apps/students/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', views.student_dashboard_stats, name='student-dashboard-stats'),
    path('profile/', views.StudentProfileView.as_view(), name='student-profile'),
    path('statistics/', views.student_statistics, name='student-statistics'),
    path('study-streak/', views.study_streak, name='study-streak'),
    
    # Quizzes
    path('quizzes/', views.QuizListView.as_view(), name='student-quizzes-list'),
    path('quizzes/<int:pk>/', views.QuizDetailView.as_view(), name='student-quiz-detail'),
    path('quizzes/recommended/', views.recommended_quizzes, name='recommended-quizzes'),
    
    # Quiz Sessions
    path('quiz-sessions/', views.QuizSessionListView.as_view(), name='quiz-sessions-list'),
    path('quiz-sessions/start/', views.QuizSessionCreateView.as_view(), name='start-quiz-session'),
    path('quiz-sessions/<int:pk>/', views.QuizSessionDetailView.as_view(), name='quiz-session-detail'),
    path('quiz-sessions/<int:session_id>/answer/', views.submit_quiz_answer, name='submit-quiz-answer'),
    path('quiz-sessions/<int:session_id>/complete/', views.complete_quiz_session, name='complete-quiz-session'),
    
    # Calendar Events
    path('calendar/events/', views.StudentCalendarEventListCreateView.as_view(), name='student-calendar-events'),
    path('calendar/events/<int:pk>/', views.StudentCalendarEventDetailView.as_view(), name='student-calendar-event-detail'),
    
    # Notes
    path('notes/', views.StudentNoteListCreateView.as_view(), name='student-notes'),
    path('notes/<int:pk>/', views.StudentNoteDetailView.as_view(), name='student-note-detail'),
    
    # Preferences
    path('preferences/', views.StudentPreferenceView.as_view(), name='student-preferences'),
    
    # Reports
    path('report-question/', views.report_question, name='report-question'),
]