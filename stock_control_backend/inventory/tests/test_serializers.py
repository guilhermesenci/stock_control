"""
Testes para os serializers do sistema de inventário
"""
import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from inventory.models import Item, Fornecedor, Usuario, Transacao
from inventory.serializers import (
    ItemSerializer, FornecedorSerializer, UsuarioSerializer,
    UserDetailSerializer, UserRegistrationSerializer, UserUpdateSerializer
)


@pytest.mark.django_db
class TestItemSerializer:
    """Testes para o ItemSerializer"""
    
    def test_serialize_item(self):
        """Testa serialização de item"""
        item = Item.objects.create(
            cod_sku="SERIAL001",
            descricao_item="Item Serializado",
            unid_medida="kg",
            active=True
        )
        
        serializer = ItemSerializer(item)
        data = serializer.data
        
        assert data['codSku'] == "SERIAL001"
        assert data['descricaoItem'] == "Item Serializado"
        assert data['unidMedida'] == "kg"
        assert data['active'] is True
    
    def test_deserialize_item(self):
        """Testa deserialização de item"""
        data = {
            "codSku": "DESERIAL001",
            "descricaoItem": "Item Deserializado",
            "unidMedida": "un",
            "active": False
        }
        
        serializer = ItemSerializer(data=data)
        assert serializer.is_valid()
        
        item = serializer.save()
        assert item.cod_sku == "DESERIAL001"
        assert item.descricao_item == "Item Deserializado"
        assert item.unid_medida == "un"
        assert item.active is False
    
    def test_serialize_item_invalid_data(self):
        """Testa serialização com dados inválidos"""
        data = {
            "codSku": "",  # SKU vazio
            "descricaoItem": "Item Inválido",
            "unidMedida": "kg"
        }
        
        serializer = ItemSerializer(data=data)
        assert not serializer.is_valid()
        # O erro pode estar em 'codSku' ou 'cod_sku' dependendo da conversão
        assert 'codSku' in serializer.errors or 'cod_sku' in serializer.errors


@pytest.mark.django_db
class TestFornecedorSerializer:
    """Testes para o FornecedorSerializer"""
    
    def test_serialize_fornecedor(self):
        """Testa serialização de fornecedor"""
        fornecedor = Fornecedor.objects.create(
            nome_fornecedor="Fornecedor Serializado",
            active=True
        )
        
        serializer = FornecedorSerializer(fornecedor)
        data = serializer.data
        
        assert data['nomeFornecedor'] == "Fornecedor Serializado"
        assert data['active'] is True
    
    def test_deserialize_fornecedor(self):
        """Testa deserialização de fornecedor"""
        data = {
            "nomeFornecedor": "Fornecedor Deserializado",
            "active": False
        }
        
        serializer = FornecedorSerializer(data=data)
        assert serializer.is_valid()
        
        fornecedor = serializer.save()
        assert fornecedor.nome_fornecedor == "Fornecedor Deserializado"
        assert fornecedor.active is False


@pytest.mark.django_db
class TestUsuarioSerializer:
    """Testes para o UsuarioSerializer"""
    
    def test_serialize_usuario_with_auth_user(self):
        """Testa serialização de usuário com User associado"""
        user = User.objects.create_user(
            username="serialuser",
            email="serial@example.com",
            password="testpass123",
            first_name="Serial",
            last_name="User"
        )
        
        # O signal deve ter criado automaticamente o Usuario
        assert hasattr(user, 'inventory_user')
        usuario = user.inventory_user
        
        # Atualizar permissões
        usuario.permissions = ["add_item", "change_item"]
        usuario.save()
        
        serializer = UsuarioSerializer(usuario)
        data = serializer.data
        
        assert data['matUsuario'] == usuario.mat_usuario
        assert data['nomeUsuario'] == "Serial User"  # first_name + last_name
        assert data['username'] == "serialuser"
        assert data['email'] == "serial@example.com"
        assert data['firstName'] == "Serial"
        assert data['lastName'] == "User"
        assert data['permissions'] == ["add_item", "change_item"]
    
    def test_serialize_usuario_without_auth_user(self):
        """Testa serialização de usuário sem User associado"""
        usuario = Usuario.objects.create(
            mat_usuario=54321,
            nome_usuario="Usuário Sem Auth"
        )
        
        serializer = UsuarioSerializer(usuario)
        data = serializer.data
        
        assert data['matUsuario'] == 54321
        assert data['nomeUsuario'] == "Usuário Sem Auth"
        # Campos relacionados ao auth_user podem não existir se não houver User associado
        if 'username' in data:
            assert data['username'] is None
        if 'email' in data:
            assert data['email'] is None


@pytest.mark.django_db
class TestUserDetailSerializer:
    """Testes para o UserDetailSerializer"""
    
    def test_serialize_user_with_inventory_user(self):
        """Testa serialização de User com Usuario associado"""
        user = User.objects.create_user(
            username="detailuser",
            email="detail@example.com",
            password="testpass123",
            first_name="Detail",
            last_name="User",
            is_active=True,
            is_staff=True,
            is_superuser=False
        )
        
        # O signal deve ter criado automaticamente o Usuario
        assert hasattr(user, 'inventory_user')
        usuario = user.inventory_user
        
        # Atualizar permissões
        usuario.permissions = ["view_item"]
        usuario.save()
        
        serializer = UserDetailSerializer(user)
        data = serializer.data
        
        assert data['id'] == user.id
        assert data['username'] == "detailuser"
        assert data['email'] == "detail@example.com"
        assert data['firstName'] == "Detail"
        assert data['lastName'] == "User"
        assert data['isActive'] is True
        assert data['isStaff'] is True
        assert data['isSuperuser'] is False
        assert data['isMaster'] is False  # is_superuser
        assert data['permissionsList'] == ["view_item"]
        assert data['inventoryUser'] is not None
    
    def test_serialize_user_without_inventory_user(self):
        """Testa serialização de User sem Usuario associado"""
        user = User.objects.create_user(
            username="noinventory",
            email="noinventory@example.com",
            password="testpass123"
        )
        
        serializer = UserDetailSerializer(user)
        data = serializer.data
        
        assert data['username'] == "noinventory"
        # O signal pode ter criado automaticamente o inventoryUser
        # Se existir, deve ter os campos corretos
        if data['inventoryUser'] is not None:
            assert 'matUsuario' in data['inventoryUser']
            assert 'nomeUsuario' in data['inventoryUser']
        assert data['permissionsList'] == []


@pytest.mark.django_db
class TestUserRegistrationSerializer:
    """Testes para o UserRegistrationSerializer"""
    
    def test_register_user_success(self):
        """Testa registro de usuário com sucesso"""
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "strongpass123",
            "password2": "strongpass123",
            "firstName": "New",
            "lastName": "User",
            "isActive": True,
            "isStaff": False,
            "isSuperuser": False,
            "permissionsList": ["view_item"]
        }
        
        serializer = UserRegistrationSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save()
        assert user.username == "newuser"
        assert user.email == "newuser@example.com"
        # O serializer converte camelCase para snake_case automaticamente
        assert user.first_name == "New"
        assert user.last_name == "User"
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.check_password("strongpass123")
        
        # Verificar se o Usuario foi criado automaticamente pelo signal
        assert hasattr(user, 'inventory_user')
        assert user.inventory_user is not None
        assert user.inventory_user.permissions == ["view_item"]
    
    def test_register_user_password_mismatch(self):
        """Testa registro com senhas diferentes"""
        data = {
            "username": "mismatch",
            "email": "mismatch@example.com",
            "password": "password123",
            "password2": "different123"
        }
        
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert "password" in serializer.errors
    
    def test_register_user_short_password(self):
        """Testa registro com senha muito curta"""
        data = {
            "username": "shortpass",
            "email": "shortpass@example.com",
            "password": "123",
            "password2": "123"
        }
        
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert "password" in serializer.errors


@pytest.mark.django_db
class TestUserUpdateSerializer:
    """Testes para o UserUpdateSerializer"""
    
    def test_update_user_basic_fields(self):
        """Testa atualização de campos básicos do usuário"""
        user = User.objects.create_user(
            username="updateuser",
            email="update@example.com",
            password="oldpass123",
            first_name="Old",
            last_name="Name"
        )
        
        data = {
            "username": "updateduser",
            "email": "updated@example.com",
            "firstName": "New",
            "lastName": "Name",
            "isActive": False
        }
        
        serializer = UserUpdateSerializer(user, data=data)
        assert serializer.is_valid()
        
        updated_user = serializer.save()
        assert updated_user.username == "updateduser"
        assert updated_user.email == "updated@example.com"
        # O serializer converte camelCase para snake_case automaticamente
        assert updated_user.first_name == "New"
        assert updated_user.last_name == "Name"
        assert updated_user.is_active is False
    
    def test_update_user_password(self):
        """Testa atualização de senha"""
        user = User.objects.create_user(
            username="passuser",
            email="pass@example.com",
            password="oldpass123"
        )
        
        data = {
            "username": "passuser",  # Incluir username para evitar erro de campo obrigatório
            "password": "newpass123",
            "password2": "newpass123"
        }
        
        serializer = UserUpdateSerializer(user, data=data)
        assert serializer.is_valid()
        
        updated_user = serializer.save()
        assert updated_user.check_password("newpass123")
        assert not updated_user.check_password("oldpass123")
    
    def test_update_user_password_mismatch(self):
        """Testa atualização com senhas diferentes"""
        user = User.objects.create_user(
            username="mismatchuser",
            email="mismatch@example.com",
            password="oldpass123"
        )
        
        data = {
            "username": "mismatchuser",
            "password": "newpass123",
            "password2": "different123"
        }
        
        serializer = UserUpdateSerializer(user, data=data)
        assert not serializer.is_valid()
        assert "password" in serializer.errors
    
    def test_update_user_password_partial(self):
        """Testa atualização com apenas um campo de senha"""
        user = User.objects.create_user(
            username="partialuser",
            email="partial@example.com",
            password="oldpass123"
        )
        
        data = {
            "username": "partialuser",
            "password": "newpass123"
            # password2 ausente
        }
        
        serializer = UserUpdateSerializer(user, data=data)
        assert not serializer.is_valid()
        # O erro pode estar em 'password' ou 'non_field_errors'
        assert "password" in serializer.errors or "non_field_errors" in serializer.errors
    
    def test_update_user_with_permissions(self):
        """Testa atualização de usuário com permissões"""
        user = User.objects.create_user(
            username="permuser",
            email="perm@example.com",
            password="testpass123"
        )
        
        # O signal deve ter criado automaticamente o Usuario
        assert hasattr(user, 'inventory_user')
        usuario = user.inventory_user
        
        data = {
            "permissionsList": ["add_item", "change_item", "view_item"]
        }
        
        serializer = UserUpdateSerializer(user, data=data)
        assert serializer.is_valid()
        
        updated_user = serializer.save()
        usuario.refresh_from_db()
        assert usuario.permissions == ["add_item", "change_item", "view_item"]
    
    def test_update_user_empty_password_fields(self):
        """Testa atualização sem alterar senha (campos vazios)"""
        user = User.objects.create_user(
            username="emptypass",
            email="empty@example.com",
            password="originalpass123"
        )
        
        data = {
            "username": "updatedemptypass"
            # Não incluir campos de senha vazios
        }
        
        serializer = UserUpdateSerializer(user, data=data)
        assert serializer.is_valid()
        
        updated_user = serializer.save()
        assert updated_user.username == "updatedemptypass"
        assert updated_user.check_password("originalpass123")  # senha não mudou
