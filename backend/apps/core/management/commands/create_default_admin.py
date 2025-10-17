from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.authentication.models import AdminAccount

User = get_user_model()

class Command(BaseCommand):
    help = 'Create default super admin for immediate access'
    
    def handle(self, *args, **options):
        # Create default super admin
        admin_email = 'admin@toothquest.com'
        admin_password = 'admin123'
        
        if User.objects.filter(email=admin_email).exists():
            self.stdout.write(
                self.style.WARNING(f'Super admin with email {admin_email} already exists')
            )
            return
        
        # Create the super admin user
        admin_user = User.objects.create_user(
            username='superadmin',
            email=admin_email,
            password=admin_password,
            full_name='Super Administrator',
            role='super_admin',
            status='active'
        )
        
        # Create admin account
        AdminAccount.objects.create(
            user=admin_user,
            role='super_admin',
            permissions=['all']
        )
        
        # Create a sample student for testing
        student_email = 'student@toothquest.com'
        student_password = 'student123'
        
        if not User.objects.filter(email=student_email).exists():
            student_user = User.objects.create_user(
                username='teststudent',
                email=student_email,
                password=student_password,
                full_name='Test Student',
                role='student',
                status='active',
                university='Algiers University of Dental Medicine',
                year=3,
                subscription_plan='3rd Year Package'
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Sample student created: {student_email} / {student_password}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Super admin created successfully!')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Email: {admin_email}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Password: {admin_password}')
        )
        self.stdout.write(
            self.style.WARNING('Please change the default password after first login!')
        )