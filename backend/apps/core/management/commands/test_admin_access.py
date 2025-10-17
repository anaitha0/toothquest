# apps/core/management/commands/test_admin_access.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

class Command(BaseCommand):
    help = 'Test admin access and generate token for testing'
    
    def handle(self, *args, **options):
        try:
            # Get admin user
            admin_user = User.objects.get(email='admin@toothquest.com')
            
            self.stdout.write(f"Admin User Details:")
            self.stdout.write(f"  ID: {admin_user.id}")
            self.stdout.write(f"  Username: {admin_user.username}")
            self.stdout.write(f"  Email: {admin_user.email}")
            self.stdout.write(f"  Role: {admin_user.role}")
            self.stdout.write(f"  Status: {admin_user.status}")
            self.stdout.write(f"  is_admin: {admin_user.is_admin}")
            self.stdout.write(f"  is_authenticated: {admin_user.is_authenticated}")
            
            # Get or create token
            token, created = Token.objects.get_or_create(user=admin_user)
            if created:
                self.stdout.write(self.style.SUCCESS('Created new token'))
            else:
                self.stdout.write('Using existing token')
            
            self.stdout.write(f"\nToken: {token.key}")
            
            # Test permission check
            admin_roles = ['admin', 'super_admin', 'moderator']
            has_admin_role = admin_user.role in admin_roles
            self.stdout.write(f"Has admin role: {has_admin_role}")
            
            # Show test curl command
            self.stdout.write(f"\nTest API access with this curl command:")
            self.stdout.write(f'curl -H "Authorization: Token {token.key}" http://localhost:8000/api/auth/debug/')
            
            self.stdout.write(f"\nTest users endpoint:")
            self.stdout.write(f'curl -H "Authorization: Token {token.key}" http://localhost:8000/api/users/')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Admin user not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))