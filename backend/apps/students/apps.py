# apps/students/apps.py
from django.apps import AppConfig

class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.students'

    def ready(self):
        # Import signals here to ensure all apps are loaded
        # This prevents AppRegistryNotReady errors during startup
        import apps.students.signals