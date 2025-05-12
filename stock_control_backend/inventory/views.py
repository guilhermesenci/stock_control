from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import Transacao, Item, Entrada, Saida, Fornecedor, Usuario
from .serializers import (
    TransacaoSerializer,
    ItemSerializer,
    EntradaSerializer,
    SaidaSerializer,
    FornecedorSerializer,
    UsuarioSerializer,
    UserRegistrationSerializer,
    StockItemSerializer,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .filters import ItemFilter, FornecedorFilter, TransacaoFilter
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import Sum, DecimalField, F
from django.db.models.functions import Coalesce
import datetime
from dateutil.relativedelta import relativedelta
from django.db.models.functions import Cast
from .utils import camelize_dict_keys


class TransacaoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, atualizar e remover Transações.
    """
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TransacaoFilter


class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, atualizar e remover Itens do estoque.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ItemFilter

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros extras
        show_only_active_items = self.request.query_params.get('show_only_active_items') == 'true'
        
        # Filtro por itens ativos
        if show_only_active_items:
            queryset = queryset.filter(active=True)
            
        return queryset

    @action(detail=True, methods=['get'], url_path='custo-medio')
    def custo_medio(self, request, pk=None):
        try:
            item = self.get_object()
            
            # Obter entradas_qtde e entradas_valor corretamente
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
                custo_medio = 0.0
            
            custo_ultima_entrada = Transacao.objects.filter(
                cod_sku=item.cod_sku,
                entradas__isnull=False
            ).order_by('-id_transacao').first()
            
            return Response(camelize_dict_keys({
                'custo_medio': custo_medio, 
                'custo_ultima_entrada': custo_ultima_entrada
            }))
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StockViewSet(viewsets.ViewSet):
    """
    ViewSet para obter informações de estoque dos produtos.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """
        Retorna a lista de produtos com informações de estoque.
        """
        # Get query parameters
        stock_date_str = request.query_params.get('stock_date', None)
        item_sku = request.query_params.get('cod_sku', '')
        item_description = request.query_params.get('descricao_item', '')
        show_only_stock_items = request.query_params.get('showOnlyStockItems') == 'true'
        show_only_active_items = request.query_params.get('showOnlyActiveItems') == 'true'
        
        # Use today's date if not provided
        if stock_date_str:
            try:
                stock_date = datetime.datetime.strptime(stock_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"detail": "Data inválida. Use o formato YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            stock_date = datetime.datetime.now().date()
        
        # Query items with filters
        items_query = Item.objects.all()
        
        if item_sku:
            items_query = items_query.filter(cod_sku__icontains=item_sku)
        
        if item_description:
            items_query = items_query.filter(descricao_item__icontains=item_description)
        
        if show_only_active_items:
            items_query = items_query.filter(active=True)
        
        # Prepare result
        result_items = []
        
        for item in items_query:
            try:
                # Calculating stock quantity - tratando SKUs alfanuméricos
                entradas = Decimal(0)
                saidas = Decimal(0)
                
                # Busca entradas para o item
                entradas_query = Transacao.objects.filter(
                    cod_sku=item.cod_sku,
                    entradas__data_entrada__lte=stock_date
                )
                
                if entradas_query.exists():
                    entradas = entradas_query.aggregate(
                        total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0))
                    )['total']
                
                # Busca saídas para o item
                saidas_query = Transacao.objects.filter(
                    cod_sku=item.cod_sku,
                    saidas__data_saida__lte=stock_date
                )
                
                if saidas_query.exists():
                    saidas = saidas_query.aggregate(
                        total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0))
                    )['total']
                
                # Calculate balance
                quantidade = entradas - saidas
                
                # Skip items with no stock if filter is applied
                if show_only_stock_items and quantidade <= 0:
                    continue
                
                # Calculate consumption estimate
                three_months_ago = stock_date - relativedelta(months=3)
                
                # Sum all outputs in the last 3 months
                saidas_recentes_query = Transacao.objects.filter(
                    cod_sku=item.cod_sku,
                    saidas__data_saida__gte=three_months_ago,
                    saidas__data_saida__lte=stock_date
                )
                
                saidas_recentes = Decimal(0)
                if saidas_recentes_query.exists():
                    saidas_recentes = saidas_recentes_query.aggregate(
                        total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0))
                    )['total']
                
                # Calculate daily average consumption (in 90 days)
                dias_periodo = 90
                media_diaria = saidas_recentes / dias_periodo if saidas_recentes > 0 else 0
                
                # Calculate estimated consumption time
                estimated_consumption_time = None
                if media_diaria > 0 and quantidade > 0:
                    dias_estimados = quantidade / media_diaria
                    
                    # Format estimated time based on number of days
                    if dias_estimados < 1:
                        estimated_consumption_time = "Menos de 1 dia"
                    elif dias_estimados < 7:
                        estimated_consumption_time = f"{int(dias_estimados)} {'dia' if int(dias_estimados) == 1 else 'dias'}"
                    elif dias_estimados < 30:
                        semanas = dias_estimados / 7
                        estimated_consumption_time = f"{int(semanas)} {'semana' if int(semanas) == 1 else 'semanas'}"
                    elif dias_estimados < 365:
                        meses = dias_estimados / 30
                        estimated_consumption_time = f"{int(meses)} {'mês' if int(meses) == 1 else 'meses'}"
                    else:
                        anos = dias_estimados / 365
                        estimated_consumption_time = f"{int(anos)} {'ano' if int(anos) == 1 else 'anos'}"
                elif quantidade <= 0:
                    estimated_consumption_time = "Sem estoque"
                else:
                    estimated_consumption_time = "Sem consumo recente"
                
                # Add item to results
                result_items.append({
                    'cod_sku': item.cod_sku,
                    'descricao_item': item.descricao_item,
                    'unid_medida': item.unid_medida,
                    'active': item.active,
                    'quantity': float(quantidade),
                    'estimated_consumption_time': estimated_consumption_time
                })
            except Exception as e:
                # Log error but continue with next item
                print(f"Erro processando item {item.cod_sku}: {str(e)}")
                continue
        
        # Return paginated response
        page = int(request.query_params.get('page', 1))
        page_size = 10
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paginated_items = result_items[start_idx:end_idx]
        total_count = len(result_items)
        
        return Response(camelize_dict_keys({
            'count': total_count,
            'next': f"/api/v1/stocks/?page={page+1}" if end_idx < total_count else None,
            'previous': f"/api/v1/stocks/?page={page-1}" if page > 1 else None,
            'results': paginated_items
        }))


class EntradaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar as entradas de produtos no estoque.
    """
    queryset = Entrada.objects.all()
    serializer_class = EntradaSerializer
    permission_classes = [IsAuthenticated]


class SaidaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar as saídas (pedidos) do estoque.
    """
    queryset = Saida.objects.all()
    serializer_class = SaidaSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Validação de estoque disponível
        transacao_id = serializer.validated_data['transacao'].id_transacao
        
        # Get the Transacao
        try:
            transacao = Transacao.objects.get(id_transacao=transacao_id)
            qtd_saida = transacao.quantidade
            cod_sku = transacao.cod_sku
            
            # Converter cod_sku para string para evitar problemas de tipo
            cod_sku_str = str(cod_sku)
            
            print(f"Verificando estoque para SKU: {cod_sku_str}, tipo: {type(cod_sku)}")
            
            # Calcular entradas de forma segura
            entradas = Transacao.objects.filter(
                cod_sku=cod_sku,
                entradas__isnull=False
            ).aggregate(total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0)))['total']
            
            # Calcular saídas de forma segura
            saidas = Transacao.objects.filter(
                cod_sku=cod_sku,
                saidas__isnull=False
            ).aggregate(total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0)))['total']
            
            print(f"Entradas: {entradas}, tipo: {type(entradas)}")
            print(f"Saídas: {saidas}, tipo: {type(saidas)}")
            
            # Garantir que estamos trabalhando com decimais
            estoque_atual = entradas - saidas
            
            print(f"Estoque atual: {estoque_atual}, tipo: {type(estoque_atual)}")
            print(f"Quantidade solicitada: {qtd_saida}, tipo: {type(qtd_saida)}")
            
            # Verificar se há estoque suficiente
            if estoque_atual < qtd_saida:
                return Response(
                    {"detail": f"Estoque insuficiente. Disponível: {estoque_atual}, Solicitado: {qtd_saida}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Transacao.DoesNotExist:
            return Response(
                {"detail": "Transação não encontrada"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class FornecedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para cadastrar e gerenciar os fornecedores.
    """
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = FornecedorFilter


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar os usuários do sistema.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    
class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuário criado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_usuario(request):
    """
    Return the current authenticated user's related Usuario instance
    """
    try:
        # Get the authenticated user
        user = request.user
        # Get their related Usuario
        usuario = Usuario.objects.get(auth_user=user)
        
        return Response(camelize_dict_keys({
            'mat_usuario': usuario.mat_usuario,
            'nome_usuario': usuario.nome_usuario
        }))
    except Usuario.DoesNotExist:
        return Response(
            {"detail": "No Usuario record found for current user"},
            status=status.HTTP_404_NOT_FOUND
        )
