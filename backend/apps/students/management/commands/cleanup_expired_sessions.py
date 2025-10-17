# apps/students/management/commands/cleanup_expired_sessions.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.students.models import QuizSession

class Command(BaseCommand):
    help = 'Clean up expired quiz sessions'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be cleaned up without making changes',
        )
    
    def handle(self, *args, **options):
        now = timezone.now()
        expired_sessions = QuizSession.objects.filter(
            status='in_progress',
            expires_at__lt=now
        )
        
        count = expired_sessions.count()
        
        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING(f'Would expire {count} quiz sessions')
            )
            for session in expired_sessions[:10]:  # Show first 10
                self.stdout.write(f'  - Session {session.id} by {session.user.email}')
            if count > 10:
                self.stdout.write(f'  ... and {count - 10} more')
        else:
            expired_sessions.update(status='expired')
            self.stdout.write(
                self.style.SUCCESS(f'Successfully expired {count} quiz sessions')
            )