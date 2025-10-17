# apps/core/management/commands/fix_admin.py (ROBUST VERSION)
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import traceback

User = get_user_model()

class Command(BaseCommand):
    help = 'Fix and verify admin account'
    
    def handle(self, *args, **options):
        self.stdout.write("Starting admin verification...")
        
        # Admin user verification
        try:
            self.fix_admin_user()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error with admin user: {e}'))
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
        
        # Student user verification
        try:
            self.fix_student_user()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error with student user: {e}'))
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
        
        self.stdout.write(self.style.SUCCESS('Command completed!'))
    
    def fix_admin_user(self):
        admin_email = 'admin@toothquest.com'
        
        with transaction.atomic():
            try:
                admin_user = User.objects.get(email=admin_email)
                self.stdout.write(f"Found admin user: {admin_user.email}")
                
                # Fix role if needed
                if admin_user.role != 'super_admin':
                    admin_user.role = 'super_admin'
                    admin_user.save(update_fields=['role'])
                    self.stdout.write(self.style.SUCCESS('Fixed admin role'))
                
                # Fix status if needed  
                if admin_user.status != 'active':
                    admin_user.status = 'active'
                    admin_user.save(update_fields=['status'])
                    self.stdout.write(self.style.SUCCESS('Fixed admin status'))
                
            except User.DoesNotExist:
                self.stdout.write('Creating admin user...')
                admin_user = User.objects.create_user(
                    username='superadmin',
                    email=admin_email,
                    password='admin123',
                    full_name='Super Administrator',
                    role='super_admin',
                    status='active'
                )
                self.stdout.write(self.style.SUCCESS('Admin user created'))
            
            # Try to create AdminAccount if the model exists
            try:
                from apps.authentication.models import AdminAccount
                admin_account, created = AdminAccount.objects.get_or_create(
                    user=admin_user,
                    defaults={
                        'role': 'super_admin',
                        'permissions': ['all']
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created AdminAccount'))
                else:
                    self.stdout.write('AdminAccount already exists')
            except ImportError:
                self.stdout.write(self.style.WARNING('AdminAccount model not available, skipping...'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'AdminAccount creation failed: {e}'))
            
            self.stdout.write(f"Admin verification complete:")
            self.stdout.write(f"  Email: {admin_user.email}")
            self.stdout.write(f"  Role: {admin_user.role}")
            self.stdout.write(f"  Status: {admin_user.status}")
            self.stdout.write(f"  is_admin: {admin_user.is_admin}")
    
    def fix_student_user(self):
        student_email = 'student@toothquest.com'
        
        with transaction.atomic():
            try:
                student_user = User.objects.get(email=student_email)
                self.stdout.write(f"Found student user: {student_user.email}")
                
                # Fix role if needed
                if student_user.role != 'student':
                    student_user.role = 'student'
                    student_user.save(update_fields=['role'])
                    self.stdout.write(self.style.SUCCESS('Fixed student role'))
                
                # Fix status if needed
                if student_user.status != 'active':
                    student_user.status = 'active'
                    student_user.save(update_fields=['status'])
                    self.stdout.write(self.style.SUCCESS('Fixed student status'))
                    
            except User.DoesNotExist:
                self.stdout.write('Creating student user...')
                
                # Create with minimal required fields first
                student_user = User.objects.create_user(
                    username='teststudent',
                    email=student_email,
                    password='student123',
                    role='student',
                    status='active'
                )
                
                # Update additional fields separately
                try:
                    student_user.full_name = 'Test Student'
                    student_user.university = 'Algiers University of Dental Medicine'
                    student_user.year = 3
                    student_user.subscription_plan = '3rd Year Package'
                    student_user.save(update_fields=['full_name', 'university', 'year', 'subscription_plan'])
                    self.stdout.write(self.style.SUCCESS('Student user created with details'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Student created but details update failed: {e}'))
            
            self.stdout.write(f"Student verification complete:")
            self.stdout.write(f"  Email: {student_user.email}")
            self.stdout.write(f"  Role: {student_user.role}")
            self.stdout.write(f"  Status: {student_user.status}")
            self.stdout.write(f"  is_student: {student_user.is_student}")