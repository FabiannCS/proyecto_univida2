from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = 'Creates a superuser.'

    def handle(self, *args, **options):
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                password='adminpassword123'  # CAMBIA ESTO POR UNA CONTRASEÑA SEGURA
            )
            self.stdout.write(self.style.SUCCESS('Superusuario creado con éxito'))
        else:
            self.stdout.write(self.style.SUCCESS('El superusuario ya existe'))