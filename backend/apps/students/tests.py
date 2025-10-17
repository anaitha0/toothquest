# apps/students/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from apps.questions.models import Question, QuestionOption
from .models import Quiz, QuizSession, QuizAnswer, StudentCalendarEvent

User = get_user_model()

class QuizModelTest(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123',
            role='admin'
        )
        
        self.quiz = Quiz.objects.create(
            title='Test Quiz',
            description='A test quiz',
            module_name='Test Module',
            year=1,
            difficulty='easy',
            time_limit_minutes=30,
            questions_count=5,
            passing_score=70,
            created_by=self.admin_user
        )
    
    def test_quiz_creation(self):
        self.assertEqual(self.quiz.title, 'Test Quiz')
        self.assertEqual(self.quiz.status, 'active')
        self.assertTrue(self.quiz.is_public)

class QuizSessionTest(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student',
            email='student@test.com',
            password='testpass123',
            role='student'
        )
        
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123',
            role='admin'
        )
        
        self.quiz = Quiz.objects.create(
            title='Test Quiz',
            module_name='Test Module',
            year=1,
            difficulty='easy',
            time_limit_minutes=30,
            questions_count=5,
            passing_score=70,
            created_by=self.admin
        )
        
        # Create a test question
        self.question = Question.objects.create(
            question_text='Test question?',
            module_name='Test Module',
            course_name='Test Course',
            year=1,
            difficulty='easy',
            explanation='Test explanation',
            created_by=self.admin
        )
        
        # Create options
        QuestionOption.objects.create(
            question=self.question,
            option_text='Option A',
            option_letter='a',
            is_correct=True
        )
        QuestionOption.objects.create(
            question=self.question,
            option_text='Option B',
            option_letter='b',
            is_correct=False
        )
    
    def test_start_quiz_session(self):
        self.client.force_authenticate(user=self.student)
        
        response = self.client.post('/api/students/quiz-sessions/start/', {
            'quiz_id': self.quiz.id
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'in_progress')
        
        # Test that we can't create duplicate sessions
        response2 = self.client.post('/api/students/quiz-sessions/start/', {
            'quiz_id': self.quiz.id
        })
        
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], response2.data['id'])
    
    def test_submit_quiz_answer(self):
        self.client.force_authenticate(user=self.student)
        
        # Start a session
        session_response = self.client.post('/api/students/quiz-sessions/start/', {
            'quiz_id': self.quiz.id
        })
        session_id = session_response.data['id']
        
        # Submit an answer
        response = self.client.post(f'/api/students/quiz-sessions/{session_id}/answer/', {
            'question_id': self.question.id,
            'selected_option': 'a',
            'time_taken_seconds': 30
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['is_correct'])
    
    def test_complete_quiz_session(self):
        self.client.force_authenticate(user=self.student)
        
        # Start a session
        session_response = self.client.post('/api/students/quiz-sessions/start/', {
            'quiz_id': self.quiz.id
        })
        session_id = session_response.data['id']
        
        # Submit an answer
        self.client.post(f'/api/students/quiz-sessions/{session_id}/answer/', {
            'question_id': self.question.id,
            'selected_option': 'a',
            'time_taken_seconds': 30
        })
        
        # Complete the session
        response = self.client.post(f'/api/students/quiz-sessions/{session_id}/complete/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
        self.assertGreater(response.data['percentage_score'], 0)

class StudentCalendarEventTest(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student',
            email='student@test.com',
            password='testpass123',
            role='student'
        )
    
    def test_create_calendar_event(self):
        self.client.force_authenticate(user=self.student)
        
        event_data = {
            'title': 'Test Event',
            'description': 'A test event',
            'event_type': 'exam',
            'event_date': (timezone.now() + timedelta(days=7)).isoformat(),
            'location': 'Room 101',
            'priority': 'high'
        }
        
        response = self.client.post('/api/students/calendar/events/', event_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Event')
        self.assertEqual(response.data['user']['id'], self.student.id)

