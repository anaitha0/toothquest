# apps/students/management/commands/generate_sample_quizzes.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.students.models import Quiz
from apps.questions.models import Question
from apps.students.utils import generate_quiz_questions

User = get_user_model()

class Command(BaseCommand):
    help = 'Generate sample quizzes for testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of quizzes to create',
        )
        parser.add_argument(
            '--admin-email',
            type=str,
            help='Email of admin user to assign as quiz creator',
        )
    
    def handle(self, *args, **options):
        count = options['count']
        admin_email = options.get('admin_email')
        
        # Get or find admin user
        if admin_email:
            try:
                admin_user = User.objects.get(email=admin_email, role__in=['admin', 'super_admin'])
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Admin user with email {admin_email} not found')
                )
                return
        else:
            admin_user = User.objects.filter(role__in=['admin', 'super_admin']).first()
            if not admin_user:
                self.stdout.write(
                    self.style.ERROR('No admin user found. Please create an admin user first.')
                )
                return
        
        # Sample quiz data
        sample_quizzes = [
            {
                'title': 'Dental Anatomy Fundamentals',
                'description': 'Basic concepts in dental anatomy and morphology',
                'module_name': 'Dental Anatomy',
                'course_name': 'Basic Dental Sciences',
                'year': 1,
                'difficulty': 'easy',
                'time_limit_minutes': 30,
                'questions_count': 20,
                'passing_score': 70
            },
            {
                'title': 'Periodontics Advanced Concepts',
                'description': 'Advanced periodontal disease management',
                'module_name': 'Periodontics',
                'course_name': 'Clinical Dentistry',
                'year': 3,
                'difficulty': 'hard',
                'time_limit_minutes': 45,
                'questions_count': 25,
                'passing_score': 75
            },
            {
                'title': 'Endodontics Clinical Practice',
                'description': 'Root canal therapy procedures and techniques',
                'module_name': 'Endodontics',
                'course_name': 'Clinical Practice',
                'year': 4,
                'difficulty': 'medium',
                'time_limit_minutes': 40,
                'questions_count': 30,
                'passing_score': 70
            },
            {
                'title': 'Oral Pathology Diagnosis',
                'description': 'Pathological conditions of oral tissues',
                'module_name': 'Oral Pathology',
                'course_name': 'Diagnostic Sciences',
                'year': 2,
                'difficulty': 'medium',
                'time_limit_minutes': 35,
                'questions_count': 22,
                'passing_score': 72
            },
            {
                'title': 'Prosthodontics Fundamentals',
                'description': 'Basic prosthetic dentistry concepts',
                'module_name': 'Prosthodontics',
                'course_name': 'Restorative Dentistry',
                'year': 3,
                'difficulty': 'medium',
                'time_limit_minutes': 30,
                'questions_count': 25,
                'passing_score': 70
            },
            {
                'title': 'Oral Surgery Procedures',
                'description': 'Common oral surgical procedures and techniques',
                'module_name': 'Oral Surgery',
                'course_name': 'Clinical Surgery',
                'year': 4,
                'difficulty': 'hard',
                'time_limit_minutes': 50,
                'questions_count': 35,
                'passing_score': 75
            },
            {
                'title': 'Orthodontics Treatment Planning',
                'description': 'Orthodontic diagnosis and treatment planning',
                'module_name': 'Orthodontics',
                'course_name': 'Orthodontic Therapy',
                'year': 5,
                'difficulty': 'hard',
                'time_limit_minutes': 60,
                'questions_count': 40,
                'passing_score': 80
            },
            {
                'title': 'Dental Materials Properties',
                'description': 'Physical and chemical properties of dental materials',
                'module_name': 'Dental Materials',
                'course_name': 'Materials Science',
                'year': 2,
                'difficulty': 'medium',
                'time_limit_minutes': 35,
                'questions_count': 25,
                'passing_score': 70
            }
        ]
        
        created_count = 0
        for i in range(count):
            quiz_data = sample_quizzes[i % len(sample_quizzes)].copy()
            
            # Make title unique
            if count > len(sample_quizzes):
                quiz_data['title'] += f' #{i+1}'
            
            quiz, created = Quiz.objects.get_or_create(
                title=quiz_data['title'],
                defaults={
                    **quiz_data,
                    'created_by': admin_user,
                    'status': 'active',
                    'is_public': True
                }
            )
            
            if created:
                # Try to generate questions for the quiz
                available_questions_count = Question.objects.filter(
                    module_name=quiz_data['module_name'],
                    is_active=True
                ).count()
                
                if available_questions_count > 0:
                    generate_quiz_questions(quiz, min(quiz_data['questions_count'], available_questions_count))
                    created_count += 1
                    self.stdout.write(f'Created quiz: {quiz.title} with {min(quiz_data["questions_count"], available_questions_count)} questions')
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Created quiz: {quiz.title} but no questions found for module {quiz_data["module_name"]}')
                    )
                    created_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(f'Quiz already exists: {quiz.title}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample quizzes')
        )