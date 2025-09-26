"""
Testes para as views da API.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, time

from ..models import Item, Transacao, Entrada, Saida, Fornecedor, Usuario


class TransactionAPITest(APITestCase):
    """Testes para as APIs de transação."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.usuario = Usuario.objects.create(
            mat_usuario=1,
            nome_usuario='Usuário Teste',
            auth_user=self.user
        )
        
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
        
        # Autenticar usuário
        self.client.force_authenticate(user=self.user)
    
    def test_recalculate_costs_endpoint(self):
        """Testa endpoint de recálculo de custos."""
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
        
        url = reverse('recalculate_costs')
        data = {
            'transactionId': transacao.id_transacao,
            'sku': 'TEST001'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
    
    def test_validate_stock_operation_endpoint(self):
        """Testa endpoint de validação de operação de estoque."""
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
        
        url = reverse('validate_stock_operation')
        data = {
            'sku': 'TEST001',
            'operationType': 'delete',
            'transactionId': transacao.id_transacao
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
    
    def test_delete_transaction_endpoint(self):
        """Testa endpoint de exclusão de transação."""
        # Criar transação de entrada
        transacao = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        entrada = Entrada.objects.create(
            transacao=transacao,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        url = reverse('delete_transaction', kwargs={'transaction_id': f'entrada-{entrada.cod_entrada}'})
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
    
    def test_update_transaction_endpoint(self):
        """Testa endpoint de atualização de transação."""
        # Criar transação de entrada
        transacao = Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('10'),
            valor_unit=Decimal('5.00'),
            cod_fornecedor=self.fornecedor
        )
        
        entrada = Entrada.objects.create(
            transacao=transacao,
            mat_usuario=self.usuario,
            data_entrada=date.today(),
            hora_entrada=time(10, 0, 0)
        )
        
        url = reverse('update_transaction', kwargs={'transaction_id': f'entrada-{entrada.cod_entrada}'})
        data = {
            'quantity': 15,
            'unitCost': 6.00
        }
        
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])


class StockAPITest(APITestCase):
    """Testes para as APIs de estoque."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.usuario = Usuario.objects.create(
            mat_usuario=1,
            nome_usuario='Usuário Teste',
            auth_user=self.user
        )
        
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
        
        # Autenticar usuário
        self.client.force_authenticate(user=self.user)
    
    def test_stock_list_endpoint(self):
        """Testa endpoint de lista de estoque."""
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
        
        url = reverse('stocks-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['quantity'], 10.0)
    
    def test_stock_cost_list_endpoint(self):
        """Testa endpoint de lista de custos de estoque."""
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
        
        url = reverse('stock-costs-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['unitCost'], 5.0)