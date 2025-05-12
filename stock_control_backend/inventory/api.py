from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Item, Transacao, Entrada, Saida
from .serializers import ItemSerializer, FornecedorSerializer
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from datetime import datetime
from .utils import camelize_dict_keys


class StockCostViewSet(viewsets.ViewSet):
    """
    API para obter custos de estoque
    """
    def list(self, request):
        """
        Retorna os custos de estoque com base na data e filtros
        """
        # Pegar data do estoque (hoje se não especificado)
        stock_date = request.query_params.get('stockDate', None)
        if stock_date:
            try:
                stock_date = datetime.strptime(stock_date, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Formato de data inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            stock_date = datetime.now().date()
        
        # Filtros adicionais
        sku_filter = request.query_params.get('sku', '')
        description_filter = request.query_params.get('description', '')
        has_stock = request.query_params.get('hasStock', '') == 'true'
        active_only = request.query_params.get('active', '') == 'true'
        
        # Consulta base: pegar todos os itens
        items_query = Item.objects.all()
        
        # Aplicar filtros
        if sku_filter:
            items_query = items_query.filter(cod_sku__icontains=sku_filter)
            
        if description_filter:
            items_query = items_query.filter(descricao_item__icontains=description_filter)
            
        if active_only:
            items_query = items_query.filter(active=True)
        
        # Calcular entradas até a data especificada
        entradas_transacoes = Transacao.objects.filter(
            entradas__data_entrada__lte=stock_date
        ).values(
            'cod_sku'
        ).annotate(
            total_entrada=Sum('quantidade')
        )
        
        # Calcular saídas até a data especificada
        saidas_transacoes = Transacao.objects.filter(
            saidas__data_saida__lte=stock_date
        ).values(
            'cod_sku'
        ).annotate(
            total_saida=Sum('quantidade')
        )
        
        # Preparar resultado
        result = []
        
        for item in items_query:
            # Calcular quantidade em estoque
            entrada_item = next(
                (e for e in entradas_transacoes if e['cod_sku'] == item.cod_sku),
                {'total_entrada': 0}
            )
            saida_item = next(
                (s for s in saidas_transacoes if s['cod_sku'] == item.cod_sku),
                {'total_saida': 0}
            )
            
            quantidade = entrada_item['total_entrada'] - saida_item['total_saida']
            
            # Aplicar filtro de estoque
            if has_stock and quantidade <= 0:
                continue
                
            entradas_aggregate = Transacao.objects.filter(
                cod_sku=item.cod_sku,
                entradas__isnull=False
            ).aggregate(
                qtde_total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0)),
                valor_total=Coalesce(Sum(F('valor_unit') * F('quantidade'), output_field=DecimalField()), Decimal(0))
            )
            
            entradas_qtde = entradas_aggregate['qtde_total']
            entradas_valor = entradas_aggregate['valor_total']

            saidas_aggregate = Transacao.objects.filter(
                cod_sku=item.cod_sku,
                saidas__isnull=False
            ).aggregate(
                qtde_total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0)),
                valor_total=Coalesce(Sum(F('valor_unit') * F('quantidade'), output_field=DecimalField()), Decimal(0))
            )

            saidas_qtde = saidas_aggregate['qtde_total']
            saidas_valor = saidas_aggregate['valor_total']
            
            estoque_atual = entradas_qtde - saidas_qtde
            valor_estoque_atual = entradas_valor - saidas_valor

            if estoque_atual > 0:
                custo_medio = valor_estoque_atual / estoque_atual
            else:
                custo_medio = Decimal(0.0)
            
            total_cost = custo_medio * estoque_atual
            
            custo_ultima_entrada = Transacao.objects.filter(
                cod_sku=item.cod_sku,
                entradas__isnull=False
            ).order_by('-id_transacao').first()
            
            # Usando snake_case nos dados internos para facilitar manipulação
            item_data = {
                'sku': item.cod_sku,
                'description': item.descricao_item,
                'quantity': float(estoque_atual),
                'unity_measure': item.unid_medida,
                'unit_cost': float(custo_medio),
                'total_cost': float(total_cost),
                'active': item.active,
                'last_entry_cost': float(custo_ultima_entrada.valor_unit) if custo_ultima_entrada else None
            }
            
            # Converter para camelCase na resposta
            result.append(camelize_dict_keys(item_data))
        
        return Response(camelize_dict_keys({
            'count': len(result),
            'results': result
        })) 