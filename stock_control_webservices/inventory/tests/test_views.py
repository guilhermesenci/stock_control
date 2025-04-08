import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User

@pytest.mark.django_db
class TestRegisterView:

    def setup_method(self):
        self.client = APIClient()
        self.url = reverse('register')


    def test_register_user_successfully(self):
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "strongpassword123",
            "password2": "strongpassword123"  # adicionado para confirmar a senha
        }
        response = self.client.post(self.url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED, f"Response: {response.json()}"
        assert "Usuário criado com sucesso" in response.data.get("message", "")
        assert User.objects.filter(username="newuser").exists()


    def test_register_with_existing_username(self):
        User.objects.create_user(username="existing", email="ex@ex.com", password="123456")
        payload = {
            "username": "existing",
            "email": "another@example.com",
            "password": "anotherpass",
            "password2": "anotherpass"
        }
        response = self.client.post(self.url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        errors = response.data.get("username", [])
        assert "already exists" in " ".join(errors).lower()


    def test_register_with_missing_fields(self):
        payload = {
            "username": "incomplete"
            # faltando email, password e password2
        }
        response = self.client.post(self.url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        errors = response.data
        assert "email" in errors or "password" in errors or "password2" in errors


    def test_register_with_invalid_email_format(self):
        payload = {
            "username": "useremail",
            "email": "not-an-email",
            "password": "123456789",
            "password2": "123456789"
        }
        response = self.client.post(self.url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data
