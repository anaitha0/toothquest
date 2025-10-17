from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.authentication.models import AdminAccount

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with admin account'
    
    def add_arguments(self, parser):
        parser.add_argument('--email', required=True)
        parser.add_argument('--password', required=True)
        parser.add_argument('--name', required=True)
    
    def handle(self, *args, **options):
        if User.objects.filter(email=options['email']).exists():
            self.stdout.write(self.style.ERROR('User already exists'))
            return
        
        user = User.objects.create_user(
            username=options['email'].split('@')[0],
            email=options['email'],
            password=options['password'],
            full_name=options['name'],
            role='super_admin',
            status='active'
        )
        
        AdminAccount.objects.create(
            user=user,
            role='super_admin',
            permissions=['all']
        )
        
        self.stdout.write(self.style.SUCCESS(f'Superuser created: {options["email"]}'))
