from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from inventory.models import Usuario


class Command(BaseCommand):
    help = 'Create Usuario records for existing Django users'

    def handle(self, *args, **options):
        users = User.objects.all()
        created_count = 0
        already_exists_count = 0
        
        self.stdout.write(f"Found {users.count()} Django users")
        
        last_usuario = Usuario.objects.order_by('-mat_usuario').first()
        next_mat = 1 if not last_usuario else last_usuario.mat_usuario + 1
        
        for user in users:
            # Check if this user already has a Usuario record
            existing = Usuario.objects.filter(auth_user=user).first()
            if existing:
                self.stdout.write(f"User {user.username} already has Usuario record (mat_usuario={existing.mat_usuario})")
                already_exists_count += 1
                continue
                
            # Create a new Usuario record
            usuario = Usuario.objects.create(
                mat_usuario=next_mat,
                nome_usuario=user.username,
                auth_user=user
            )
            self.stdout.write(f"Created Usuario for {user.username} with mat_usuario={next_mat}")
            next_mat += 1
            created_count += 1
            
        self.stdout.write(self.style.SUCCESS(
            f"Done! Created {created_count} new Usuario records. {already_exists_count} already existed."
        )) 