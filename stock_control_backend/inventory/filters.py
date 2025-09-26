import django_filters
from .models import Item, Fornecedor, Transacao, Entrada, Saida, Usuario
from django.contrib.auth.models import User


class ItemFilter(django_filters.FilterSet):
    """
    Filtros para o modelo Item.
    Suporta tanto snake_case quanto camelCase para compatibilidade com frontend.
    """
    # Filtros em snake_case
    descricao_item = django_filters.CharFilter(lookup_expr='icontains')
    cod_sku = django_filters.CharFilter(lookup_expr='icontains')
    unid_medida = django_filters.CharFilter(lookup_expr='icontains')
    active = django_filters.BooleanFilter()
    
    # Filtros em camelCase para compatibilidade com frontend
    descricaoItem = django_filters.CharFilter(lookup_expr='icontains', field_name='descricao_item')
    codSku = django_filters.CharFilter(lookup_expr='icontains', field_name='cod_sku')
    unidMedida = django_filters.CharFilter(lookup_expr='icontains', field_name='unid_medida')
    showOnlyActiveItems = django_filters.BooleanFilter(field_name='active')

    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('cod_sku', 'codSku'),
            ('descricao_item', 'descricaoItem'),
            ('unid_medida', 'unidMedida'),
            ('active', 'active'),
        ),
        field_labels={
            'cod_sku': 'Código SKU',
            'descricao_item': 'Descrição',
            'unid_medida': 'Unidade de Medida',
            'active': 'Ativo',
        }
    )

    class Meta:
        model = Item
        fields = [
            'cod_sku', 
            'descricao_item', 
            'unid_medida', 
            'active'
        ]


class FornecedorFilter(django_filters.FilterSet):
    """
    Filtros para o modelo Fornecedor.
    """
    nome_fornecedor = django_filters.CharFilter(lookup_expr='icontains')
    active = django_filters.BooleanFilter()
    
    # Filtro em camelCase para compatibilidade com frontend
    nomeFornecedor = django_filters.CharFilter(lookup_expr='icontains', field_name='nome_fornecedor')
    
    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('nome_fornecedor', 'nomeFornecedor'),
            ('active', 'active'),
        ),
        field_labels={
            'nome_fornecedor': 'Nome do Fornecedor',
            'active': 'Ativo',
        }
    )

    class Meta:
        model = Fornecedor
        fields = ['nome_fornecedor', 'active']


class TransacaoFilter(django_filters.FilterSet):
    """
    Filtros para o modelo Transacao.
    """
    # Filtros em snake_case
    cod_nf = django_filters.CharFilter(lookup_expr='exact')
    cod_sku = django_filters.CharFilter(lookup_expr='exact')
    cod_fornecedor = django_filters.NumberFilter(lookup_expr='exact')
    
    # Filtros em camelCase para compatibilidade com frontend
    codNf = django_filters.CharFilter(field_name='cod_nf', lookup_expr='exact')
    codSku = django_filters.CharFilter(field_name='cod_sku', lookup_expr='exact')
    codFornecedor = django_filters.NumberFilter(field_name='cod_fornecedor', lookup_expr='exact')
    
    # Filtros de data para entradas
    dataEntradaAfter = django_filters.DateFilter(
        field_name='entradas__data_entrada', 
        lookup_expr='gte', 
        distinct=True
    )
    dataEntradaBefore = django_filters.DateFilter(
        field_name='entradas__data_entrada', 
        lookup_expr='lte', 
        distinct=True
    )
    
    # Filtros de data para saídas
    dataSaidaAfter = django_filters.DateFilter(
        field_name='saidas__data_saida', 
        lookup_expr='gte', 
        distinct=True
    )
    dataSaidaBefore = django_filters.DateFilter(
        field_name='saidas__data_saida', 
        lookup_expr='lte', 
        distinct=True
    )

    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('id_transacao', 'idTransacao'),
            ('cod_nf', 'codNf'),
            ('cod_sku', 'codSku'),
            ('quantidade', 'quantidade'),
            ('valor_unit', 'valorUnit'),
            ('cod_fornecedor', 'codFornecedor'),
        ),
        field_labels={
            'id_transacao': 'ID da Transação',
            'cod_nf': 'Nota Fiscal',
            'cod_sku': 'SKU',
            'quantidade': 'Quantidade',
            'valor_unit': 'Valor Unitário',
            'cod_fornecedor': 'Fornecedor',
        }
    )

    class Meta:
        model = Transacao
        fields = [
            'cod_nf', 'cod_sku', 'cod_fornecedor'
        ]


class EntradaFilter(django_filters.FilterSet):
    """
    Filtros para o modelo Entrada.
    """
    # Filtros de data
    dataEntradaAfter = django_filters.DateFilter(
        field_name='data_entrada',
        lookup_expr='gte'
    )
    dataEntradaBefore = django_filters.DateFilter(
        field_name='data_entrada',
        lookup_expr='lte'
    )
    
    # Filtros de transação em snake_case
    cod_nf = django_filters.CharFilter(
        field_name='transacao__cod_nf',
        lookup_expr='exact'
    )
    cod_sku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )
    
    # Filtros de transação em camelCase
    codNf = django_filters.CharFilter(
        field_name='transacao__cod_nf',
        lookup_expr='exact'
    )
    codSku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )

    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('cod_entrada', 'codEntrada'),
            ('data_entrada', 'dataEntrada'),
            ('hora_entrada', 'horaEntrada'),
            ('transacao__cod_sku', 'codSku'),
            ('transacao__cod_nf', 'codNf'),
        ),
        field_labels={
            'cod_entrada': 'Código da Entrada',
            'data_entrada': 'Data da Entrada',
            'hora_entrada': 'Hora da Entrada',
            'transacao__cod_sku': 'SKU',
            'transacao__cod_nf': 'Nota Fiscal',
        }
    )

    class Meta:
        model = Entrada
        fields = []


class SaidaFilter(django_filters.FilterSet):
    """
    Filtros para o modelo Saida.
    """
    # Filtros de data
    dataSaidaAfter = django_filters.DateFilter(
        field_name='data_saida',
        lookup_expr='gte'
    )
    dataSaidaBefore = django_filters.DateFilter(
        field_name='data_saida',
        lookup_expr='lte'
    )
    
    # Filtros de transação em snake_case
    cod_sku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )
    
    # Filtros de transação em camelCase
    codSku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )

    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('cod_pedido', 'codPedido'),
            ('data_saida', 'dataSaida'),
            ('hora_saida', 'horaSaida'),
            ('transacao__cod_sku', 'codSku'),
        ),
        field_labels={
            'cod_pedido': 'Código do Pedido',
            'data_saida': 'Data da Saída',
            'hora_saida': 'Hora da Saída',
            'transacao__cod_sku': 'SKU',
        }
    )

    class Meta:
        model = Saida
        fields = []


class StockFilter(django_filters.FilterSet):
    """
    Filtros para o endpoint de estoque.
    """
    # Filtros em snake_case
    cod_sku = django_filters.CharFilter(lookup_expr='icontains')
    descricao_item = django_filters.CharFilter(lookup_expr='icontains')
    stock_date = django_filters.DateFilter()
    show_only_stock_items = django_filters.BooleanFilter()
    show_only_active_items = django_filters.BooleanFilter()
    
    # Filtros em camelCase para compatibilidade com frontend
    codSku = django_filters.CharFilter(field_name='cod_sku', lookup_expr='icontains')
    descricaoItem = django_filters.CharFilter(field_name='descricao_item', lookup_expr='icontains')
    stockDate = django_filters.DateFilter(field_name='stock_date')
    showOnlyStockItems = django_filters.BooleanFilter(field_name='show_only_stock_items')
    showOnlyActiveItems = django_filters.BooleanFilter(field_name='show_only_active_items')
    
    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('cod_sku', 'codSku'),
            ('descricao_item', 'descricaoItem'),
            ('unid_medida', 'unidMedida'),
            ('active', 'active'),
        ),
        field_labels={
            'cod_sku': 'Código SKU',
            'descricao_item': 'Descrição',
            'unid_medida': 'Unidade de Medida',
            'active': 'Ativo',
        }
    )

    class Meta:
        model = Item
        fields = [
            'cod_sku', 
            'descricao_item', 
            'unid_medida', 
            'active'
        ]


class UsuarioFilter(django_filters.FilterSet):
    """
    Filtros para o modelo Usuario.
    """
    nome_usuario = django_filters.CharFilter(lookup_expr='icontains')
    mat_usuario = django_filters.NumberFilter()
    
    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('mat_usuario', 'matUsuario'),
            ('nome_usuario', 'nomeUsuario'),
        ),
        field_labels={
            'mat_usuario': 'Matrícula',
            'nome_usuario': 'Nome do Usuário',
        }
    )

    class Meta:
        model = Usuario
        fields = ['mat_usuario', 'nome_usuario']


class UserFilter(django_filters.FilterSet):
    """
    Filtros para o modelo User do Django.
    """
    username = django_filters.CharFilter(lookup_expr='icontains')
    email = django_filters.CharFilter(lookup_expr='icontains')
    first_name = django_filters.CharFilter(lookup_expr='icontains')
    last_name = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    is_staff = django_filters.BooleanFilter()
    
    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('username', 'username'),
            ('email', 'email'),
            ('first_name', 'firstName'),
            ('last_name', 'lastName'),
            ('is_active', 'isActive'),
            ('is_staff', 'isStaff'),
        ),
        field_labels={
            'username': 'Nome de Usuário',
            'email': 'Email',
            'first_name': 'Primeiro Nome',
            'last_name': 'Último Nome',
            'is_active': 'Ativo',
            'is_staff': 'Staff',
        }
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff']