import django_filters
from .models import Item, Fornecedor, Transacao, Entrada, Saida

class ItemFilter(django_filters.FilterSet):
    descricao_item = django_filters.CharFilter(lookup_expr='icontains', field_name='descricaoItem')
    cod_sku = django_filters.CharFilter(lookup_expr='icontains', field_name='codSku')
    unid_medida = django_filters.CharFilter(lookup_expr='icontains', field_name='unidMedida')
    active = django_filters.BooleanFilter(field_name='active')
    
    stock_date = django_filters.DateFilter(field_name='stockDate')
    show_only_stock_items = django_filters.BooleanFilter(field_name='showOnlyStockItems')
    show_only_active_items = django_filters.BooleanFilter(field_name='showOnlyActiveItems')

    descricaoItem = django_filters.CharFilter(lookup_expr='icontains', field_name='descricao_item')
    codSku = django_filters.CharFilter(lookup_expr='icontains', field_name='cod_sku')
    unidMedida = django_filters.CharFilter(lookup_expr='icontains', field_name='unid_medida')    
    stockDate = django_filters.DateFilter(field_name='stock_date')
    showOnlyStockItems = django_filters.BooleanFilter(field_name='show_only_stock_items')
    showOnlyActiveItems = django_filters.BooleanFilter(field_name='show_only_active_items')

    class Meta:
        model = Item
        fields = [
            'cod_sku', 
            'descricao_item', 
            'unid_medida', 
            'active', 
            'stock_date', 
            'show_only_stock_items', 
            'show_only_active_items'
        ]

class FornecedorFilter(django_filters.FilterSet):
    nome_fornecedor = django_filters.CharFilter(lookup_expr='icontains')
    active = django_filters.BooleanFilter()

    nomeFornecedor = django_filters.CharFilter(lookup_expr='icontains', field_name='nome_fornecedor')
    class Meta:
        model = Fornecedor
        fields = ['nome_fornecedor', 'active']


class TransacaoFilter(django_filters.FilterSet):
    cod_nf = django_filters.CharFilter(field_name='cod_nf', lookup_expr='exact')
    cod_sku = django_filters.CharFilter(field_name='cod_sku', lookup_expr='exact')
    cod_fornecedor = django_filters.NumberFilter(field_name='cod_fornecedor', lookup_expr='exact')

    codNf = django_filters.CharFilter(field_name='cod_nf', lookup_expr='exact')
    codSku = django_filters.CharFilter(field_name='cod_sku', lookup_expr='exact')
    codFornecedor = django_filters.NumberFilter(field_name='cod_fornecedor', lookup_expr='exact')
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

    class Meta:
        model = Transacao
        fields = [
            'cod_nf', 'cod_sku', 'cod_fornecedor', 
            'codNf', 'codSku', 'codFornecedor', 
            'dataEntradaAfter', 'dataEntradaBefore', 
            'dataSaidaAfter', 'dataSaidaBefore'
        ]


class EntradaFilter(django_filters.FilterSet):
    dataEntradaAfter = django_filters.DateFilter(
        field_name='data_entrada',
        lookup_expr='gte'
    )
    dataEntradaBefore = django_filters.DateFilter(
        field_name='data_entrada',
        lookup_expr='lte'
    )
    # Add filter for transaction fields
    cod_nf = django_filters.CharFilter(
        field_name='transacao__cod_nf',
        lookup_expr='exact'
    )
    cod_sku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )
    codNf = django_filters.CharFilter(
        field_name='transacao__cod_nf',
        lookup_expr='exact'
    )
    codSku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )

    class Meta:
        model = Entrada
        fields = [
            'dataEntradaAfter', 'dataEntradaBefore',
            'cod_nf', 'cod_sku', 'codNf', 'codSku'
        ]


class SaidaFilter(django_filters.FilterSet):
    dataSaidaAfter = django_filters.DateFilter(
        field_name='data_saida',
        lookup_expr='gte'
    )
    dataSaidaBefore = django_filters.DateFilter(
        field_name='data_saida',
        lookup_expr='lte'
    )
    # Add filter for transaction fields
    cod_sku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )
    codSku = django_filters.CharFilter(
        field_name='transacao__cod_sku',
        lookup_expr='exact'
    )

    class Meta:
        model = Saida
        fields = [
            'dataSaidaAfter', 'dataSaidaBefore',
            'cod_sku', 'codSku'
        ]
