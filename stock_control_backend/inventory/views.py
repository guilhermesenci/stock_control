from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Transacao, Item, Entrada, Saida, Fornecedor, Usuario, User
from .serializers import (
    TransacaoSerializer,
    ItemSerializer,
    EntradaSerializer,
    SaidaSerializer,
    FornecedorSerializer,
    UsuarioSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    UserDetailSerializer,
    StockItemSerializer,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filters import ItemFilter, FornecedorFilter, TransacaoFilter, EntradaFilter, SaidaFilter
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import Sum, DecimalField, F, Prefetch, Q
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
    
    def create(self, request, *args, **kwargs):
        """
        Override create method to validate stock availability for saidas
        """
        # Check if this is a transaction for a 'saida' by looking for 'is_saida' flag in request
        is_saida = request.data.get('is_saida', False)
        
        if is_saida:
            # This will be a saida transaction, we need to check stock availability
            try:
                cod_sku = request.data.get('cod_sku')
                quantidade = Decimal(request.data.get('quantidade', 0))
                
                print(f"Verificando estoque para SKU: {cod_sku}, quantidade: {quantidade}")
                if not cod_sku or quantidade <= 0:
                    return Response(
                        {"detail": "Dados inválidos para validação de estoque"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Calculate current stock
                entradas = Transacao.objects.filter(
                    cod_sku=cod_sku,
                    entradas__isnull=False
                ).aggregate(total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0)))['total']
                
                saidas = Transacao.objects.filter(
                    cod_sku=cod_sku,
                    saidas__isnull=False
                ).aggregate(total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0)))['total']
                
                estoque_atual = entradas - saidas
                
                # Check if there's enough stock
                if estoque_atual < quantidade:
                    return Response(
                        {"detail": f"Estoque insuficiente. Disponível: {estoque_atual}, Solicitado: {quantidade}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {"detail": f"Erro ao validar estoque: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Continue with normal creation
        return super().create(request, *args, **kwargs)


class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, atualizar e remover Itens do estoque.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ItemFilter
    search_fields = ['cod_sku', 'descricao_item']

    def get_queryset(self):
        # change pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 100

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
            
            # Buscar última entrada com segurança
            ultima_entrada = Transacao.objects.filter(
                cod_sku=item.cod_sku,
                entradas__isnull=False
            ).order_by('-id_transacao').first()
            
            # Definir custo da última entrada ou usar 0 se não existir
            custo_ultima_entrada = ultima_entrada.valor_unit if ultima_entrada else Decimal(0)
            
            custo_medio, custo_ultima_entrada = round(custo_medio, 2), round(custo_ultima_entrada, 2)
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

        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 100

        stock_date_str = request.query_params.get('stockDate', None)
        item_sku = request.query_params.get('codSku', '')
        item_description = request.query_params.get('descricaoItem', '')
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
                print('item:', item.cod_sku)
                
                # Busca entradas para o item
                entradas_query = Transacao.objects.filter(
                    cod_sku=item.cod_sku,
                    entradas__data_entrada__lte=stock_date
                )
                print('entradas_query:', entradas_query)

                if entradas_query.exists():
                    entradas = entradas_query.aggregate(
                        total=Coalesce(Sum('quantidade', output_field=DecimalField()), Decimal(0))
                    )['total']
                
                # Busca saídas para o item
                saidas_query = Transacao.objects.filter(
                    cod_sku=item.cod_sku,
                    saidas__data_saida__lte=stock_date
                )
                print('saidas_query:', saidas_query)
                
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
        
        # Return all items without pagination
        return Response(camelize_dict_keys({
            'results': result_items
        }))


class EntradaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar as entradas de produtos no estoque.
    """
    queryset = Entrada.objects.all()
    serializer_class = EntradaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = EntradaFilter


class SaidaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar as saídas (pedidos) do estoque.
    """
    queryset = Saida.objects.all()
    serializer_class = SaidaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = SaidaFilter
    
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
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Usuario.objects.all().select_related('auth_user')


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar usuários do sistema usando o modelo User do Django.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserDetailSerializer
    
    def get_queryset(self):
        return User.objects.all().prefetch_related('inventory_user')


class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Usuário criado com sucesso!",
                "user": UserDetailSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Return the current authenticated user with detailed information
    """
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_inventory_info(request):
    """
    Return the current authenticated user's inventory usuario information.
    This endpoint specifically returns the mat_usuario needed for transactions.
    If no associated Usuario instance exists, one will be created.
    """
    user = request.user
    
    try:
        # Check if the user has an associated Usuario instance
        if not hasattr(user, 'inventory_user') or user.inventory_user is None:
            # Create a new Usuario instance for this user
            last_usuario = Usuario.objects.order_by('-mat_usuario').first()
            new_mat_usuario = 1 if not last_usuario else last_usuario.mat_usuario + 1
            
            usuario = Usuario.objects.create(
                mat_usuario=new_mat_usuario,
                nome_usuario=user.get_full_name() or user.username,
                auth_user=user
            )
            print(f"Created new Usuario record for {user.username} with mat_usuario={new_mat_usuario}")
        else:
            usuario = user.inventory_user
        
        # Return just the necessary information for transactions
        return Response({
            'id': usuario.mat_usuario,  # Return mat_usuario as id
            'nomeUsuario': usuario.nome_usuario
        })
    except Exception as e:
        return Response(
            {"detail": f"Error retrieving user inventory info: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unified_transactions(request):
    """
    Returns combined transaction data with related entry/exit, item, and user data in a single call.
    This optimizes frontend performance by reducing multiple API calls to one.
    """
    # Get query parameters
    date_from = request.query_params.get('dateFrom', None)
    date_to = request.query_params.get('dateTo', None)
    nota_fiscal = request.query_params.get('notaFiscal', None)
    sku = request.query_params.get('sku', None)
    description = request.query_params.get('description', None)
    
    # Optimization: Use prefetch_related to efficiently load related objects
    transacao_prefetch = Prefetch(
        'transacao', 
        queryset=Transacao.objects.select_related('cod_sku', 'cod_fornecedor')
    )
    
    # Base queryset for entries with prefetched relationships
    entradas_qs = Entrada.objects.select_related('mat_usuario').prefetch_related(transacao_prefetch)
    
    # Base queryset for exits with prefetched relationships
    saidas_qs = Saida.objects.select_related('mat_usuario').prefetch_related(transacao_prefetch)
    
    # Apply date filters
    if date_from:
        entradas_qs = entradas_qs.filter(data_entrada__gte=date_from)
        saidas_qs = saidas_qs.filter(data_saida__gte=date_from)
    if date_to:
        entradas_qs = entradas_qs.filter(data_entrada__lte=date_to)
        saidas_qs = saidas_qs.filter(data_saida__lte=date_to)
    
    # Apply nota fiscal filter (only for entries)
    if nota_fiscal:
        entradas_qs = entradas_qs.filter(transacao__cod_nf=nota_fiscal)
        # Skip exits when searching by invoice number
        saidas_qs = saidas_qs.none()
    
    # Apply SKU filter
    if sku:
        entradas_qs = entradas_qs.filter(transacao__cod_sku=sku)
        saidas_qs = saidas_qs.filter(transacao__cod_sku=sku)
    
    # Apply description filter
    if description:
        entradas_qs = entradas_qs.filter(transacao__cod_sku__descricao_item__icontains=description)
        saidas_qs = saidas_qs.filter(transacao__cod_sku__descricao_item__icontains=description)
    
    # Optimization: Add order_by to get consistent ordering and improve DB caching
    entradas_qs = entradas_qs.order_by('-data_entrada', '-hora_entrada')
    saidas_qs = saidas_qs.order_by('-data_saida', '-hora_saida')
    
    # Fetch all entries and exits without pagination
    entradas_list = list(entradas_qs)
    saidas_list = list(saidas_qs)
    
    # Build combined result list
    result = []
    
    # Process entradas
    for entrada in entradas_list:
        transaction = entrada.transacao
        item = transaction.cod_sku
        usuario = entrada.mat_usuario
        
        result.append({
            'id': f'entrada-{entrada.cod_entrada}',
            'idTransacao': transaction.id_transacao,
            'transactionType': 'entrada',
            'date': entrada.data_entrada.isoformat(),
            'time': entrada.hora_entrada.isoformat(),
            'sku': item.cod_sku,
            'description': item.descricao_item,
            'quantity': float(transaction.quantidade),
            'unityMeasure': item.unid_medida,
            'unitCost': float(transaction.valor_unit),
            'totalCost': float(transaction.quantidade * transaction.valor_unit),
            'notaFiscal': transaction.cod_nf,
            'username': usuario.nome_usuario if usuario else 'N/A'
        })
    
    # Process saidas
    for saida in saidas_list:
        transaction = saida.transacao
        item = transaction.cod_sku
        usuario = saida.mat_usuario
        
        result.append({
            'id': f'saida-{saida.cod_pedido}',
            'idTransacao': transaction.id_transacao,
            'transactionType': 'saida',
            'date': saida.data_saida.isoformat(),
            'time': saida.hora_saida.isoformat(),
            'sku': item.cod_sku,
            'description': item.descricao_item,
            'quantity': float(transaction.quantidade),
            'unityMeasure': item.unid_medida,
            'unitCost': float(transaction.valor_unit),
            'totalCost': float(transaction.quantidade * transaction.valor_unit),
            'username': usuario.nome_usuario if usuario else 'N/A'
        })
    
    # Return response without pagination
    return Response({'results': result})
