import django_filters
from .models import Item, Fornecedor, Transacao

class ItemFilter(django_filters.FilterSet):
    descricao_item = django_filters.CharFilter(lookup_expr='icontains')
    cod_sku = django_filters.CharFilter(lookup_expr='icontains')
    unid_medida = django_filters.CharFilter(lookup_expr='icontains')
    active = django_filters.BooleanFilter()
    
    # Novos filtros serão processados na view
    stock_date = django_filters.DateFilter()
    show_only_stock_items = django_filters.BooleanFilter()
    show_only_active_items = django_filters.BooleanFilter()

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

    class Meta:
        model = Transacao
        fields = ['cod_nf', 'cod_sku', 'cod_fornecedor', 'codNf', 'codSku', 'codFornecedor']
