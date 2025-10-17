# apps/core/management/commands/__init__.py (empty file)

# apps/core/management/commands/create_sample_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.authentication.models import AdminAccount, AccessCode
from apps.questions.models import Module, Course, Question, QuestionOption
from apps.users.models import UserProgress
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample data for development'
    
    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create super admin
        if not User.objects.filter(email='admin@toothquest.com').exists():
            admin_user = User.objects.create_user(
                username='superadmin',
                email='admin@toothquest.com',
                password='admin123',
                full_name='Super Administrator',
                role='super_admin',
                status='active'
            )
            AdminAccount.objects.create(
                user=admin_user,
                role='super_admin',
                permissions=['all']
            )
            self.stdout.write('Created super admin')
        
        # Create sample modules
        modules_data = [
            {'name': 'Periodontics', 'year': 2, 'description': 'Study of periodontal diseases'},
            {'name': 'Dental Materials', 'year': 3, 'description': 'Properties of dental materials'},
            {'name': 'Endodontics', 'year': 2, 'description': 'Root canal treatment'},
            {'name': 'Oral Anatomy', 'year': 1, 'description': 'Structure of oral cavity'},
            {'name': 'Cariology', 'year': 1, 'description': 'Study of dental caries'},
        ]
        
        for module_data in modules_data:
            module, created = Module.objects.get_or_create(
                name=module_data['name'],
                defaults=module_data
            )
            if created:
                # Create courses for each module
                Course.objects.create(
                    name=f"{module.name} Basics",
                    module=module,
                    description=f"Basic concepts of {module.name}"
                )
                Course.objects.create(
                    name=f"{module.name} Advanced",
                    module=module,
                    description=f"Advanced topics in {module.name}"
                )
        
        # Create sample questions
        if Question.objects.count() < 10:
            questions_data = [
                {
                    'question_text': 'Which of the following is NOT a part of the periodontium?',
                    'module': 'Periodontics',
                    'difficulty': 'medium',
                    'explanation': 'The periodontium includes the gingiva, periodontal ligament, cementum, and alveolar bone. Dentin is a part of the tooth structure.',
                    'options': [
                        {'letter': 'a', 'text': 'Cementum', 'correct': False},
                        {'letter': 'b', 'text': 'Alveolar bone', 'correct': False},
                        {'letter': 'c', 'text': 'Dentin', 'correct': True},
                        {'letter': 'd', 'text': 'Periodontal ligament', 'correct': False},
                    ]
                },
                {
                    'question_text': 'What is the primary function of the dental pulp?',
                    'module': 'Endodontics',
                    'difficulty': 'medium',
                    'explanation': 'The dental pulp has multiple functions including sensation, nutrition, defense, and dentin formation.',
                    'options': [
                        {'letter': 'a', 'text': 'Providing sensation', 'correct': False},
                        {'letter': 'b', 'text': 'Nutrition', 'correct': False},
                        {'letter': 'c', 'text': 'Defense', 'correct': False},
                        {'letter': 'd', 'text': 'All of the above', 'correct': True},
                    ]
                }
            ]
            
            admin_user = User.objects.filter(role='super_admin').first()
            
            for q_data in questions_data:
                module = Module.objects.get(name=q_data['module'])
                course = module.courses.first()
                
                question = Question.objects.create(
                    question_text=q_data['question_text'],
                    module=module,
                    course=course,
                    year=module.year,
                    difficulty=q_data['difficulty'],
                    explanation=q_data['explanation'],
                    created_by=admin_user
                )
                
                for option_data in q_data['options']:
                    QuestionOption.objects.create(
                        question=question,
                        option_text=option_data['text'],
                        option_letter=option_data['letter'],
                        is_correct=option_data['correct']
                    )
        
        # Create sample students
        if User.objects.filter(role='student').count() < 5:
            students_data = [
                {'username': 'sarah.j', 'email': 'sarah.j@example.com', 'full_name': 'Sarah Johnson', 'year': 1},
                {'username': 'ahmed.h', 'email': 'ahmed.h@example.com', 'full_name': 'Ahmed Hassan', 'year': 3},
                {'username': 'maria.g', 'email': 'maria.g@example.com', 'full_name': 'Maria Garcia', 'year': 3},
                {'username': 'ali.m', 'email': 'ali.m@example.com', 'full_name': 'Ali Mohammed', 'year': 2},
                {'username': 'john.s', 'email': 'john.s@example.com', 'full_name': 'John Smith', 'year': 4},
            ]
            
            for student_data in students_data:
                user = User.objects.create_user(
                    password='student123',
                    role='student',
                    status=random.choice(['active', 'pending']),
                    university='Algiers University of Dental Medicine',
                    subscription_plan=f"{student_data['year']}{'st' if student_data['year']==1 else 'nd' if student_data['year']==2 else 'rd' if student_data['year']==3 else 'th'} Year Package",
                    **student_data
                )
                
                # Create user progress
                UserProgress.objects.create(
                    user=user,
                    total_questions_attempted=random.randint(50, 200),
                    correct_answers=random.randint(30, 150)
                )
        
        # Create sample access codes
        if AccessCode.objects.count() < 5:
            packages = ['1st Year Package', '2nd Year Package', '3rd Year Package', 'Complete Package']
            for i, package in enumerate(packages):
                AccessCode.objects.create(
                    code=f"TQ{i+1}-ABC123",
                    package=package,
                    status='unused'
                )
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
