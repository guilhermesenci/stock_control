import django_filters
from .models import Item

class ItemFilter(django_filters.FilterSet):
    descricao_item = django_filters.CharFilter(lookup_expr='icontains')
    cod_sku = django_filters.NumberFilter()
    unid_medida = django_filters.CharFilter(lookup_expr='icontains')
    active = django_filters.BooleanFilter()

    class Meta:
        model = Item
        fields = ['cod_sku', 'descricao_item', 'unid_medida', 'active']
