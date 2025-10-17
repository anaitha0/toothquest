from django.urls import path
from . import views

urlpatterns = [
    # Modules
    path('modules/', views.ModuleListCreateView.as_view(), name='modules-list'),
    path('modules/<int:pk>/', views.ModuleDetailView.as_view(), name='modules-detail'),
    
    # Courses
    path('courses/', views.CourseListCreateView.as_view(), name='courses-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='courses-detail'),
    
    # Questions
    path('', views.QuestionListCreateView.as_view(), name='questions-list'),
    path('<int:pk>/', views.QuestionDetailView.as_view(), name='questions-detail'),
    
    # Reports
    path('reports/', views.QuestionReportListCreateView.as_view(), name='reports-list'),
    path('reports/<int:pk>/', views.QuestionReportDetailView.as_view(), name='reports-detail'),
    path('reports/<int:pk>/resolve/', views.resolve_report, name='resolve-report'),
    path('reports/<int:pk>/dismiss/', views.dismiss_report, name='dismiss-report'),
]