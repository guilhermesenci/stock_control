"""
Testes para os serviços do sistema de inventário.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, time

from ..models import Item, Transacao, Entrada, Saida, Fornecedor, Usuario
from ..services import StockService, TransactionService, UserService


class StockServiceTest(TestCase):
    """Testes para o StockService."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.item = Item.objects.create(
            cod_sku='TEST001',
            descricao_item='Item de Teste',
            unid_medida='UN',
            active=True
        )
        
        self.fornecedor = Fornecedor.objects.create(
            nome_fornecedor='Fornecedor Teste',
            active=True
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.usuario = Usuario.objects.create(
            mat_usuario=999,
            nome_usuario='Usuário Teste',
            auth_user=self.user
        )
    
    def test_calculate_stock_quantity_no_transactions(self):
        """Testa cálculo de estoque sem transações."""
        quantity = StockService.calculate_stock_quantity(self.item)
        self.assertEqual(quantity, Decimal('0'))
    
    def test_calculate_stock_quantity_with_entries(self):
        """Testa cálculo de estoque com entradas."""
        # Criar transação de entrada
        transacao = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        # Criar entrada
        Entrada.objects.create(
            transacao=transacao,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        quantity = StockService.calculate_stock_quantity(self.item)
        self.assertEqual(quantity, Decimal('10'))
    
    def test_calculate_stock_quantity_with_entries_and_exits(self):
        """Testa cálculo de estoque com entradas e saídas."""
        # Criar transação de entrada
        transacao_entrada = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        Entrada.objects.create(
            transacao=transacao_entrada,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        # Criar transação de saída
        transacao_saida = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('3'),
            valor_unit=Decimal('5.00')
        )
        
        Saida.objects.create(
            transacao=transacao_saida,
            mat_usuario=self.usuario,
            data_saida=date.today(),
            hora_saida=time(11, 0, 0)
        )
        
        quantity = StockService.calculate_stock_quantity(self.item)
        self.assertEqual(quantity, Decimal('7'))
    
    def test_calculate_average_cost(self):
        """Testa cálculo de custo médio."""
        # Criar transação de entrada
        transacao = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        Entrada.objects.create(
            transacao=transacao,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        avg_cost = StockService.calculate_average_cost(self.item)
        self.assertEqual(avg_cost, Decimal('5.00'))
    
    def test_get_last_entry_cost(self):
        """Testa obtenção do custo da última entrada."""
        # Criar transação de entrada
        transacao = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        Entrada.objects.create(
            transacao=transacao,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        last_cost = StockService.get_last_entry_cost(self.item)
        self.assertEqual(last_cost, Decimal('5.00'))


class TransactionServiceTest(TestCase):
    """Testes para o TransactionService."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.item = Item.objects.create(
            cod_sku='TEST001',
            descricao_item='Item de Teste',
            unid_medida='UN',
            active=True
        )
        
        self.fornecedor = Fornecedor.objects.create(
            nome_fornecedor='Fornecedor Teste',
            active=True
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.usuario = Usuario.objects.create(
            mat_usuario=999,
            nome_usuario='Usuário Teste',
            auth_user=self.user
        )
    
    def test_validate_stock_availability_sufficient(self):
        """Testa validação de estoque disponível - estoque suficiente."""
        # Criar transação de entrada
        transacao = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        Entrada.objects.create(
            transacao=transacao,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        result = TransactionService.validate_stock_availability('TEST001', Decimal('5'))
        self.assertTrue(result['valid'])
        self.assertEqual(result['message'], 'Estoque disponível')
    
    def test_validate_stock_availability_insufficient(self):
        """Testa validação de estoque disponível - estoque insuficiente."""
        # Criar transação de entrada
        transacao = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        Entrada.objects.create(
            transacao=transacao,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        result = TransactionService.validate_stock_availability('TEST001', Decimal('15'))
        self.assertFalse(result['valid'])
        self.assertIn('Estoque insuficiente', result['message'])
    
    def test_validate_stock_after_operation_delete_valid(self):
        """Testa validação de operação de exclusão - válida."""
        # Criar transação de entrada
        transacao_entrada = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        Entrada.objects.create(
            transacao=transacao_entrada,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        # Criar transação de saída
        transacao_saida = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('3'),
            valor_unit=Decimal('5.00')
        )
        
        Saida.objects.create(
            transacao=transacao_saida,
            mat_usuario=self.usuario,
            data_saida=date.today(),
            hora_saida=time(11, 0, 0)
        )
        
        result = TransactionService.validate_stock_after_operation(
            'TEST001', 'delete', transacao_entrada.id_transacao
        )
        self.assertTrue(result['valid'])
    
    def test_validate_stock_after_operation_delete_invalid(self):
        """Testa validação de operação de exclusão - inválida."""
        # Criar transação de entrada
        transacao_entrada = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        Entrada.objects.create(
            transacao=transacao_entrada,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        # Criar transação de saída
        transacao_saida = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('8'),
            valor_unit=Decimal('5.00')
        )
        
        Saida.objects.create(
            transacao=transacao_saida,
            mat_usuario=self.usuario,
            data_saida=date.today(),
            hora_saida=time(11, 0, 0)
        )
        
        result = TransactionService.validate_stock_after_operation(
            'TEST001', 'delete', transacao_entrada.id_transacao
        )
        self.assertFalse(result['valid'])
        self.assertIn('estoque negativo', result['message'])


class UserServiceTest(TestCase):
    """Testes para o UserService."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_get_or_create_inventory_user_new(self):
        """Testa criação de novo usuário de inventário."""
        usuario = UserService.get_or_create_inventory_user(self.user)
        
        self.assertIsNotNone(usuario)
        self.assertEqual(usuario.auth_user, self.user)
        self.assertEqual(usuario.nome_usuario, self.user.username)
        self.assertEqual(usuario.mat_usuario, 999)
    
    def test_get_or_create_inventory_user_existing(self):
        """Testa obtenção de usuário de inventário existente."""
        # Criar usuário de inventário
        usuario_existente = Usuario.objects.create(
            mat_usuario=999,
            nome_usuario='Usuário Teste',
            auth_user=self.user
        )
        
        usuario = UserService.get_or_create_inventory_user(self.user)
        
        self.assertEqual(usuario, usuario_existente)
        self.assertEqual(usuario.mat_usuario, 999)
