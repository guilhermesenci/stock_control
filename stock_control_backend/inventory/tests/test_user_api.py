"""
Testes para as APIs de usuário (User) do sistema
"""
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from inventory.models import Usuario


@pytest.mark.django_db
class TestUserAPI:
    """Testes para as APIs de User"""
    
    @pytest.fixture
    def client(self):
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, client):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        client.force_authenticate(user=user)
        return client
    
    @pytest.fixture
    def test_user(self):
        return User.objects.create_user(
            username='targetuser',
            email='target@example.com',
            password='targetpass123',
            first_name='Target',
            last_name='User',
            is_active=True,
            is_staff=False,
            is_superuser=False
        )
    
    def test_list_users_requires_authentication(self, client):
        """Testa que listar usuários requer autenticação"""
        url = reverse('user-list')
        response = client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_users_authenticated(self, authenticated_client):
        """Testa listagem de usuários autenticada"""
        # Criar alguns usuários de teste
        User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='pass123'
        )
        User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='pass123'
        )
        
        url = reverse('user-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        users = data.get('results', data)
        assert len(users) >= 3  # testuser + user1 + user2
    
    def test_get_user_detail(self, authenticated_client, test_user):
        """Testa obter detalhes de um usuário específico"""
        url = reverse('user-detail', args=[test_user.id])
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data['id'] == test_user.id
        assert data['username'] == 'targetuser'
        assert data['email'] == 'target@example.com'
        assert data['firstName'] == 'Target'
        assert data['lastName'] == 'User'
        assert data['isActive'] is True
        assert data['isStaff'] is False
        assert data['isSuperuser'] is False
        assert data['isMaster'] is False
    
    def test_update_user_basic_fields(self, authenticated_client, test_user):
        """Testa atualização de campos básicos do usuário"""
        url = reverse('user-detail', args=[test_user.id])
        data = {
            'username': 'updateduser',
            'email': 'updated@example.com',
            'firstName': 'Updated',
            'lastName': 'Name',
            'isActive': False
        }
        
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        test_user.refresh_from_db()
        assert test_user.username == 'updateduser'
        assert test_user.email == 'updated@example.com'
        assert test_user.first_name == 'Updated'
        assert test_user.last_name == 'Name'
        assert test_user.is_active is False
    
    def test_update_user_password(self, authenticated_client, test_user):
        """Testa atualização de senha do usuário"""
        url = reverse('user-detail', args=[test_user.id])
        data = {
            'password': 'newpassword123',
            'password2': 'newpassword123'
        }
        
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        test_user.refresh_from_db()
        assert test_user.check_password('newpassword123')
        assert not test_user.check_password('targetpass123')
    
    def test_update_user_password_mismatch(self, authenticated_client, test_user):
        """Testa atualização de senha com senhas diferentes"""
        url = reverse('user-detail', args=[test_user.id])
        data = {
            'password': 'newpassword123',
            'password2': 'differentpassword123'
        }
        
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.json()
    
    def test_update_user_password_partial(self, authenticated_client, test_user):
        """Testa atualização com apenas um campo de senha"""
        url = reverse('user-detail', args=[test_user.id])
        data = {
            'password': 'newpassword123'
            # password2 ausente
        }
        
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # O erro pode estar em 'password' ou 'nonFieldErrors'
        response_data = response.json()
        assert 'password' in response_data or 'nonFieldErrors' in response_data
    
    def test_update_user_with_permissions(self, authenticated_client, test_user):
        """Testa atualização de usuário com permissões"""
        # O signal deve ter criado automaticamente o Usuario
        assert hasattr(test_user, 'inventory_user')
        usuario = test_user.inventory_user
        
        url = reverse('user-detail', args=[test_user.id])
        data = {
            'permissionsList': ['add_item', 'change_item', 'view_item']
        }
        
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        usuario.refresh_from_db()
        assert usuario.permissions == ['add_item', 'change_item', 'view_item']
    
    def test_delete_user(self, authenticated_client, test_user):
        """Testa exclusão de usuário"""
        url = reverse('user-detail', args=[test_user.id])
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verificar se o usuário foi deletado
        with pytest.raises(User.DoesNotExist):
            User.objects.get(id=test_user.id)


@pytest.mark.django_db
class TestUserRegistrationAPI:
    """Testes para a API de registro de usuários"""
    
    @pytest.fixture
    def client(self):
        return APIClient()
    
    def test_register_user_success(self, client):
        """Testa registro de usuário com sucesso"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'firstName': 'New',
            'lastName': 'User',
            'isActive': True,
            'isStaff': False,
            'isSuperuser': False,
            'permissionsList': ['view_item']
        }
        
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verificar se o usuário foi criado
        user = User.objects.get(username='newuser')
        assert user.email == 'newuser@example.com'
        assert user.first_name == 'New'
        assert user.last_name == 'User'
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.check_password('strongpass123')
        
        # Verificar se o Usuario foi criado automaticamente
        assert hasattr(user, 'inventory_user')
        assert user.inventory_user is not None
        assert user.inventory_user.permissions == ['view_item']
    
    def test_register_user_password_mismatch(self, client):
        """Testa registro com senhas diferentes"""
        url = reverse('register')
        data = {
            'username': 'mismatch',
            'email': 'mismatch@example.com',
            'password': 'password123',
            'password2': 'different123'
        }
        
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.json()
    
    def test_register_user_duplicate_username(self, client):
        """Testa registro com username duplicado"""
        User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='pass123'
        )
        
        url = reverse('register')
        data = {
            'username': 'existing',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.json()
    
    def test_register_user_missing_fields(self, client):
        """Testa registro com campos obrigatórios ausentes"""
        url = reverse('register')
        data = {
            'username': 'incomplete'
            # faltando email, password, password2
        }
        
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        errors = response.json()
        assert 'email' in errors or 'password' in errors or 'password2' in errors
    
    def test_register_user_short_password(self, client):
        """Testa registro com senha muito curta"""
        url = reverse('register')
        data = {
            'username': 'shortpass',
            'email': 'shortpass@example.com',
            'password': '123',
            'password2': '123'
        }
        
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.json()


@pytest.mark.django_db
class TestCurrentUserAPI:
    """Testes para a API de usuário atual"""
    
    @pytest.fixture
    def client(self):
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, client):
        user = User.objects.create_user(
            username='currentuser',
            email='current@example.com',
            password='currentpass123',
            first_name='Current',
            last_name='User'
        )
        client.force_authenticate(user=user)
        return client
    
    def test_get_current_user_requires_authentication(self, client):
        """Testa que obter usuário atual requer autenticação"""
        url = reverse('current_user_info')
        response = client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_current_user_authenticated(self, authenticated_client):
        """Testa obter informações do usuário atual"""
        url = reverse('current_user_info')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data['username'] == 'currentuser'
        assert data['email'] == 'current@example.com'
        assert data['firstName'] == 'Current'
        assert data['lastName'] == 'User'
    
    def test_get_current_user_inventory_info(self, authenticated_client):
        """Testa obter informações de inventário do usuário atual"""
        url = reverse('current_user_inventory_info')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert 'id' in data
        assert 'nomeUsuario' in data
        # O id deve ser o mat_usuario do Usuario associado
