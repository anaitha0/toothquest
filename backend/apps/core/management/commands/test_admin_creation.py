# apps/core/management/commands/test_admin_creation.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.authentication.models import AdminAccount
from apps.core.constants import ADMIN_PERMISSIONS

User = get_user_model()

class Command(BaseCommand):
    help = 'Test admin creation with proper permissions'
    
    def handle(self, *args, **options):
        self.stdout.write('Testing admin creation with permissions...')
        
        # Test Super Admin creation
        self.test_super_admin_creation()
        
        # Test different role creations
        self.test_role_permissions()
        
        self.stdout.write(self.style.SUCCESS('All tests completed!'))
    
    def test_super_admin_creation(self):
        self.stdout.write('\n--- Testing Super Admin Creation ---')
        
        # Create a super admin
        super_admin_user = User.objects.create_user(
            username='test_super',
            email='test_super@toothquest.com',
            password='test123',
            full_name='Test Super Admin',
            role='super_admin',
            status='active'
        )
        
        # Create admin account with ALL permissions
        admin_account = AdminAccount.objects.create(
            user=super_admin_user,
            role='super_admin',
            permissions=list(ADMIN_PERMISSIONS.keys())  # ALL permissions
        )
        
        self.stdout.write(f'✅ Super Admin created: {super_admin_user.email}')
        self.stdout.write(f'   Permissions count: {len(admin_account.permissions)}')
        self.stdout.write(f'   Total available: {len(ADMIN_PERMISSIONS)}')
        self.stdout.write(f'   Has all permissions: {len(admin_account.permissions) == len(ADMIN_PERMISSIONS)}')
        
        # List some permissions
        self.stdout.write('   Sample permissions:')
        for perm in admin_account.permissions[:5]:
            perm_name = ADMIN_PERMISSIONS.get(perm, perm)
            self.stdout.write(f'     - {perm}: {perm_name}')
        
        if len(admin_account.permissions) > 5:
            self.stdout.write(f'     ... and {len(admin_account.permissions) - 5} more')
    
    def test_role_permissions(self):
        self.stdout.write('\n--- Testing Role-Based Permissions ---')
        
        roles_permissions = {
            'admin': [
                'users.view', 'users.create', 'users.edit', 'users.suspend',
                'questions.view', 'questions.create', 'questions.edit', 'questions.moderate',
                'codes.view', 'codes.generate', 'codes.download',
                'stats.view', 'stats.export',
            ],
            'moderator': [
                'users.view', 'users.suspend',
                'questions.view', 'questions.moderate',
                'codes.view',
                'stats.view',
            ],
            'viewer': [
                'users.view',
                'questions.view',
                'codes.view',
                'stats.view',
            ]
        }
        
        for role, expected_permissions in roles_permissions.items():
            # Create user
            user = User.objects.create_user(
                username=f'test_{role}',
                email=f'test_{role}@toothquest.com',
                password='test123',
                full_name=f'Test {role.title()}',
                role=role,
                status='active'
            )
            
            # Create admin account
            admin_account = AdminAccount.objects.create(
                user=user,
                role=role,
                permissions=expected_permissions
            )
            
            self.stdout.write(f'✅ {role.title()} created: {user.email}')
            self.stdout.write(f'   Permissions: {len(admin_account.permissions)}')
            self.stdout.write(f'   Expected: {len(expected_permissions)}')
            self.stdout.write(f'   Match: {set(admin_account.permissions) == set(expected_permissions)}')
        
        self.stdout.write('\n--- Permission Categories Available ---')
        categories = {}
        for perm_key, perm_name in ADMIN_PERMISSIONS.items():
            category = perm_key.split('.')[0]
            if category not in categories:
                categories[category] = []
            categories[category].append(f"{perm_key}: {perm_name}")
        
        for category, perms in categories.items():
            self.stdout.write(f'\n{category.upper()}:')
            for perm in perms:
                self.stdout.write(f'  - {perm}')
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--cleanup',
            action='store_true',
            help='Clean up test data after creation',
        )
    
    def handle(self, *args, **options):
        # Run tests
        super().handle(*args, **options)
        
        # Cleanup if requested
        if options['cleanup']:
            self.stdout.write('\n--- Cleaning up test data ---')
            test_emails = [
                'test_super@toothquest.com',
                'test_admin@toothquest.com', 
                'test_moderator@toothquest.com',
                'test_viewer@toothquest.com'
            ]
            
            deleted_count = User.objects.filter(email__in=test_emails).delete()[0]
            self.stdout.write(f'🗑️  Deleted {deleted_count} test users')