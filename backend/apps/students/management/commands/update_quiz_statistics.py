# apps/students/management/commands/update_quiz_statistics.py
from django.core.management.base import BaseCommand
from django.db.models import Avg, Count
from apps.students.models import Quiz, QuizSession
from apps.students.utils import calculate_quiz_statistics

class Command(BaseCommand):
    help = 'Update statistics for all quizzes'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--quiz-id',
            type=int,
            help='Update statistics for a specific quiz ID',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output',
        )
    
    def handle(self, *args, **options):
        quiz_id = options.get('quiz_id')
        verbose = options['verbose']
        
        if quiz_id:
            try:
                quiz = Quiz.objects.get(id=quiz_id)
                quizzes = [quiz]
            except Quiz.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Quiz with ID {quiz_id} not found')
                )
                return
        else:
            quizzes = Quiz.objects.filter(status='active')
        
        total_updated = 0
        
        for quiz in quizzes:
            stats = calculate_quiz_statistics(quiz)
            
            if verbose or quiz_id:
                self.stdout.write(f'\nQuiz: {quiz.title}')
                self.stdout.write(f'  Module: {quiz.module_name}')
                self.stdout.write(f'  Year: {quiz.year}')
                self.stdout.write(f'  Difficulty: {quiz.difficulty}')
                self.stdout.write(f'  Total Attempts: {stats["total_attempts"]}')
                self.stdout.write(f'  Average Score: {stats["average_score"]}%')
                self.stdout.write(f'  Pass Rate: {stats["pass_rate"]}%')
                self.stdout.write(f'  Average Time: {stats["average_time"]} minutes')
                self.stdout.write(f'  Difficulty Rating: {stats["difficulty_rating"]}')
                self.stdout.write('-' * 50)
            
            total_updated += 1
        
        if not verbose and not quiz_id:
            self.stdout.write(
                self.style.SUCCESS(f'Updated statistics for {total_updated} quizzes')
            )
        
        # Overall statistics
        if not quiz_id:
            total_sessions = QuizSession.objects.filter(status='completed').count()
            avg_score_all = QuizSession.objects.filter(status='completed').aggregate(
                avg=Avg('score')
            )['avg'] or 0
            
            self.stdout.write('\n' + '='*60)
            self.stdout.write('OVERALL STATISTICS')
            self.stdout.write('='*60)
            self.stdout.write(f'Total Completed Quiz Sessions: {total_sessions}')
            self.stdout.write(f'Average Score Across All Quizzes: {avg_score_all:.1f}%')
            self.stdout.write(f'Total Active Quizzes: {quizzes.count()}')
            
            # Statistics by difficulty
            difficulty_stats = {}
            for difficulty in ['easy', 'medium', 'hard']:
                difficulty_sessions = QuizSession.objects.filter(
                    status='completed',
                    quiz__difficulty=difficulty
                )
                if difficulty_sessions.exists():
                    avg_score = difficulty_sessions.aggregate(avg=Avg('score'))['avg']
                    count = difficulty_sessions.count()
                    difficulty_stats[difficulty] = {
                        'count': count,
                        'avg_score': avg_score
                    }
            
            if difficulty_stats:
                self.stdout.write('\nStatistics by Difficulty:')
                for difficulty, stats in difficulty_stats.items():
                    self.stdout.write(
                        f'  {difficulty.title()}: {stats["count"]} sessions, '
                        f'{stats["avg_score"]:.1f}% average score'
                    )