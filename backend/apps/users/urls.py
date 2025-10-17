from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListView.as_view(), name='users-list'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='users-detail'),
    path('<int:pk>/activate/', views.activate_user, name='activate-user'),
    path('<int:pk>/block/', views.block_user, name='block-user'),
    path('<int:pk>/delete/', views.delete_user, name='delete-user'),
    path('activities/', views.UserActivityListView.as_view(), name='user-activities'),
    path('quiz-attempts/', views.QuizAttemptListView.as_view(), name='quiz-attempts'),
    path('statistics/', views.user_statistics, name='user-statistics'),
]