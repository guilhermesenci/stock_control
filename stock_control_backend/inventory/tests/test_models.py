"""
Testes para os modelos do sistema de inventário
"""
import pytest
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from inventory.models import (
    Item, Fornecedor, Usuario, Transacao, Entrada, Saida
)


@pytest.mark.django_db
class TestItemModel:
    """Testes para o modelo Item"""
    
    def test_create_item(self):
        """Testa criação de item"""
        item = Item.objects.create(
            cod_sku="ITEM001",
            descricao_item="Produto de Teste",
            unid_medida="kg"
        )
        
        assert item.cod_sku == "ITEM001"
        assert item.descricao_item == "Produto de Teste"
        assert item.unid_medida == "kg"
        assert item.active is True  # valor padrão
        assert str(item) == "ITEM001 - Produto de Teste"
    
    def test_item_duplicate_sku(self):
        """Testa que não é possível criar itens com SKU duplicado"""
        Item.objects.create(
            cod_sku="DUPLICATE",
            descricao_item="Primeiro Item",
            unid_medida="kg"
        )
        
        with pytest.raises(IntegrityError):
            Item.objects.create(
                cod_sku="DUPLICATE",
                descricao_item="Segundo Item",
                unid_medida="un"
            )
    
    def test_item_inactive(self):
        """Testa criação de item inativo"""
        item = Item.objects.create(
            cod_sku="INACTIVE",
            descricao_item="Item Inativo",
            unid_medida="kg",
            active=False
        )
        
        assert item.active is False


@pytest.mark.django_db
class TestFornecedorModel:
    """Testes para o modelo Fornecedor"""
    
    def test_create_fornecedor(self):
        """Testa criação de fornecedor"""
        fornecedor = Fornecedor.objects.create(
            nome_fornecedor="Fornecedor Teste"
        )
        
        assert fornecedor.nome_fornecedor == "Fornecedor Teste"
        assert fornecedor.active is True  # valor padrão
        assert str(fornecedor) == "Fornecedor Teste"
    
    def test_fornecedor_inactive(self):
        """Testa criação de fornecedor inativo"""
        fornecedor = Fornecedor.objects.create(
            nome_fornecedor="Fornecedor Inativo",
            active=False
        )
        
        assert fornecedor.active is False


@pytest.mark.django_db
class TestUsuarioModel:
    """Testes para o modelo Usuario"""
    
    def test_create_usuario(self):
        """Testa criação de usuário via signal"""
        user = User.objects.create_user(
            username="testuser_model",
            email="testmodel@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User"
        )
        
        # O signal deve ter criado automaticamente o Usuario
        assert hasattr(user, 'inventory_user')
        assert user.inventory_user is not None
        
        usuario = user.inventory_user
        assert usuario.nome_usuario == "Test User"  # first_name + last_name
        assert usuario.auth_user == user
        assert str(usuario) == "Test User"
    
    def test_usuario_without_auth_user(self):
        """Testa criação de usuário sem User associado"""
        usuario = Usuario.objects.create(
            mat_usuario=54321,
            nome_usuario="Usuário Sem Auth"
        )
        
        assert usuario.mat_usuario == 54321
        assert usuario.nome_usuario == "Usuário Sem Auth"
        assert usuario.auth_user is None
    
    def test_usuario_permissions(self):
        """Testa campo de permissões"""
        usuario = Usuario.objects.create(
            mat_usuario=99999,
            nome_usuario="Usuário com Permissões",
            permissions=["add_item", "change_item"]
        )
        
        assert usuario.permissions == ["add_item", "change_item"]


@pytest.mark.django_db
class TestTransacaoModel:
    """Testes para o modelo Transacao"""
    
    def test_create_transacao(self):
        """Testa criação de transação"""
        item = Item.objects.create(
            cod_sku="TRANS001",
            descricao_item="Item para Transação",
            unid_medida="kg"
        )
        
        fornecedor = Fornecedor.objects.create(
            nome_fornecedor="Fornecedor Transação"
        )
        
        transacao = Transacao.objects.create(
            cod_nf="NF001",
            cod_sku=item,
            quantidade=Decimal("10.50"),
            valor_unit=Decimal("25.99"),
            cod_fornecedor=fornecedor
        )
        
        assert transacao.cod_nf == "NF001"
        assert transacao.cod_sku == item
        assert transacao.quantidade == Decimal("10.50")
        assert transacao.valor_unit == Decimal("25.99")
        assert transacao.cod_fornecedor == fornecedor
        assert str(transacao) == f"Transação {transacao.id_transacao}"
    
    def test_transacao_without_fornecedor(self):
        """Testa criação de transação sem fornecedor"""
        item = Item.objects.create(
            cod_sku="TRANS002",
            descricao_item="Item sem Fornecedor",
            unid_medida="un"
        )
        
        transacao = Transacao.objects.create(
            cod_nf="NF002",
            cod_sku=item,
            quantidade=Decimal("5"),
            valor_unit=Decimal("15.00")
        )
        
        assert transacao.cod_fornecedor is None


@pytest.mark.django_db
class TestEntradaModel:
    """Testes para o modelo Entrada"""
    
    def test_create_entrada(self):
        """Testa criação de entrada"""
        item = Item.objects.create(
            cod_sku="ENT001",
            descricao_item="Item para Entrada",
            unid_medida="kg"
        )
        
        usuario = Usuario.objects.create(
            mat_usuario=11111,
            nome_usuario="Usuário Entrada"
        )
        
        transacao = Transacao.objects.create(
            cod_nf="NF_ENT001",
            cod_sku=item,
            quantidade=Decimal("20"),
            valor_unit=Decimal("30.00")
        )
        
        entrada = Entrada.objects.create(
            transacao=transacao,
            mat_usuario=usuario,
            data_entrada="2024-01-15",
            hora_entrada="14:30:00"
        )
        
        assert entrada.transacao == transacao
        assert entrada.mat_usuario == usuario
        assert str(entrada.data_entrada) == "2024-01-15"
        assert str(entrada.hora_entrada) == "14:30:00"
        assert str(entrada) == f"Entrada {entrada.cod_entrada}"


@pytest.mark.django_db
class TestSaidaModel:
    """Testes para o modelo Saida"""
    
    def test_create_saida(self):
        """Testa criação de saída"""
        item = Item.objects.create(
            cod_sku="SAI001",
            descricao_item="Item para Saída",
            unid_medida="un"
        )
        
        usuario = Usuario.objects.create(
            mat_usuario=22222,
            nome_usuario="Usuário Saída"
        )
        
        transacao = Transacao.objects.create(
            cod_nf="NF_SAI001",
            cod_sku=item,
            quantidade=Decimal("5"),
            valor_unit=Decimal("40.00")
        )
        
        saida = Saida.objects.create(
            transacao=transacao,
            mat_usuario=usuario,
            data_saida="2024-01-16",
            hora_saida="10:15:00"
        )
        
        assert saida.transacao == transacao
        assert saida.mat_usuario == usuario
        assert str(saida.data_saida) == "2024-01-16"
        assert str(saida.hora_saida) == "10:15:00"
        assert str(saida) == f"Pedido {saida.cod_pedido}"


@pytest.mark.django_db
class TestUsuarioSignal:
    """Testes para os signals do modelo Usuario"""
    
    def test_create_usuario_signal(self):
        """Testa criação automática de Usuario quando User é criado"""
        # Verificar que não há usuários inicialmente
        assert Usuario.objects.count() == 0
        
        # Criar User
        user = User.objects.create_user(
            username="signaluser",
            email="signal@example.com",
            password="testpass123",
            first_name="Signal",
            last_name="User"
        )
        
        # Verificar se Usuario foi criado automaticamente
        assert Usuario.objects.count() == 1
        usuario = Usuario.objects.first()
        assert usuario.auth_user == user
        assert usuario.nome_usuario == "Signal User"  # first_name + last_name
    
    def test_create_usuario_signal_username_fallback(self):
        """Testa criação de Usuario com fallback para username"""
        # Criar User sem first_name e last_name
        user = User.objects.create_user(
            username="fallbackuser",
            email="fallback@example.com",
            password="testpass123"
        )
        
        # Verificar se Usuario foi criado com username como nome
        usuario = Usuario.objects.first()
        assert usuario.nome_usuario == "fallbackuser"
    
    def test_create_multiple_usuarios_signal(self):
        """Testa criação de múltiplos usuários com mat_usuario sequencial"""
        # Criar primeiro usuário
        user1 = User.objects.create_user(
            username="user1",
            email="user1@example.com",
            password="testpass123"
        )
        
        # Criar segundo usuário
        user2 = User.objects.create_user(
            username="user2",
            email="user2@example.com",
            password="testpass123"
        )
        
        # Verificar mat_usuario sequencial
        usuarios = Usuario.objects.all().order_by('mat_usuario')
        assert usuarios[0].mat_usuario == 1
        assert usuarios[1].mat_usuario == 2
