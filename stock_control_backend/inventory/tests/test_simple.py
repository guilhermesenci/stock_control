"""
Testes simples para verificar se as funcionalidades básicas estão funcionando.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from datetime import date, time

from ..models import Item, Transacao, Entrada, Saida, Fornecedor, Usuario
from ..services import StockService, TransactionService


class SimpleServiceTest(TestCase):
    """Testes simples para os serviços."""
    
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
