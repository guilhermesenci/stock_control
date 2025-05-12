from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
            
        try:
            # Tenta encontrar o usuário pelo email
            user = User.objects.filter(email=username).first()
            if user and user.check_password(password):
                return user
                
            # Se não encontrar pelo email, tenta pelo username
            user = User.objects.filter(username=username).first()
            if user and user.check_password(password):
                return user
                
        except Exception:
            return None
            
        return None 