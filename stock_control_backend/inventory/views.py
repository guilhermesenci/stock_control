from decimal import Decimal
from datetime import datetime
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

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
)
from .filters import ItemFilter, FornecedorFilter, TransacaoFilter, EntradaFilter, SaidaFilter, UsuarioFilter, UserFilter
from .services import StockService, TransactionService, UserService
from .utils import camelize_dict_keys


class TransacaoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, atualizar e remover Transações.
    """
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = TransacaoFilter

    def get_queryset(self):
        # Configure pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 10
        return super().get_queryset()
    
    def create(self, request, *args, **kwargs):
        """
        Override create method to validate stock availability for saidas.
        """
        # Check if this is a transaction for a 'saida' by looking for 'is_saida' flag in request
        is_saida = request.data.get('is_saida', False)
        
        if is_saida:
            # This will be a saida transaction, we need to check stock availability
            try:
                cod_sku = request.data.get('cod_sku')
                quantidade = Decimal(request.data.get('quantidade', 0))
                
                if not cod_sku or quantidade <= 0:
                    return Response(
                        {"detail": "Dados inválidos para validação de estoque"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Use service to validate stock
                validation = TransactionService.validate_stock_availability(cod_sku, quantidade)
                
                if not validation['valid']:
                    return Response(
                        {"detail": validation['message']},
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
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ItemFilter
    search_fields = ['cod_sku', 'descricao_item']

    def get_queryset(self):
        # change pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 10

        queryset = super().get_queryset()
        
        # Filtros extras
        show_only_active_items = self.request.query_params.get('show_only_active_items') == 'true'
        
        # Filtro por itens ativos
        if show_only_active_items:
            queryset = queryset.filter(active=True)
            
        return queryset

    @action(detail=True, methods=['get'], url_path='custo-medio')
    def custo_medio(self, request, pk=None):
        """
        Retorna o custo médio e custo da última entrada de um item.
        """
        try:
            item = self.get_object()
            
            # Use service to calculate costs
            custo_medio = StockService.calculate_average_cost(item)
            custo_ultima_entrada = StockService.get_last_entry_cost(item)
            
            # Round values
            custo_medio = round(custo_medio, 2)
            custo_ultima_entrada = round(custo_ultima_entrada, 2)
            
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
        stock_date_str = request.query_params.get('stockDate', None)
        item_sku = request.query_params.get('codSku', '')
        item_description = request.query_params.get('descricaoItem', '')
        show_only_stock_items = request.query_params.get('showOnlyStockItems') == 'true'
        show_only_active_items = request.query_params.get('showOnlyActiveItems') == 'true'
        
        # Get ordering parameters
        ordering = request.query_params.get('ordering', '')
        
        # Parse date
        if stock_date_str:
            try:
                stock_date = datetime.strptime(stock_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"detail": "Data inválida. Use o formato YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            stock_date = datetime.now().date()
        
        # Use service to get stock items
        result_items = StockService.get_stock_items(
            stock_date=stock_date,
            sku_filter=item_sku,
            description_filter=item_description,
            show_only_stock_items=show_only_stock_items,
            show_only_active_items=show_only_active_items
        )
        
        # Apply ordering if specified
        if ordering:
            # Sort the results using camelCase field names directly
            def sort_key(item):
                key_values = []
                for field in ordering.split(','):
                    field = field.strip()
                    if field.startswith('-'):
                        # Descending order
                        field_name = field[1:]
                        if field_name == 'codSku':
                            key_values.append(item.get('codSku', ''))
                        elif field_name == 'descricaoItem':
                            key_values.append(item.get('descricaoItem', ''))
                        elif field_name == 'unidMedida':
                            key_values.append(item.get('unidMedida', ''))
                        elif field_name == 'active':
                            key_values.append(item.get('active', False))
                        elif field_name == 'quantity':
                            key_values.append(item.get('quantity', 0))
                        elif field_name == 'estimatedConsumptionTime':
                            key_values.append(item.get('estimatedConsumptionTime', ''))
                    else:
                        # Ascending order
                        if field == 'codSku':
                            key_values.append(item.get('codSku', ''))
                        elif field == 'descricaoItem':
                            key_values.append(item.get('descricaoItem', ''))
                        elif field == 'unidMedida':
                            key_values.append(item.get('unidMedida', ''))
                        elif field == 'active':
                            key_values.append(item.get('active', False))
                        elif field == 'quantity':
                            key_values.append(item.get('quantity', 0))
                        elif field == 'estimatedConsumptionTime':
                            key_values.append(item.get('estimatedConsumptionTime', ''))
                return key_values
            
            # Determine if we need reverse sorting based on the first field
            reverse_sort = ordering.split(',')[0].strip().startswith('-') if ordering else False
            result_items.sort(key=sort_key, reverse=reverse_sort)
        
        # Apply pagination
        page_size = int(request.query_params.get('page_size', 10))
        page = int(request.query_params.get('page', 1))
        
        total_count = len(result_items)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        paginated_results = result_items[start_index:end_index]
        
        # Calculate pagination info
        total_pages = (total_count + page_size - 1) // page_size
        
        return Response({
            'results': paginated_results,
            'count': total_count,
            'total': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'next': page < total_pages,
            'previous': page > 1
        })


class EntradaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar as entradas de produtos no estoque.
    """
    queryset = Entrada.objects.all()
    serializer_class = EntradaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = EntradaFilter

    def get_queryset(self):
        # Configure pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 10
        return super().get_queryset()


class SaidaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar as saídas (pedidos) do estoque.
    """
    queryset = Saida.objects.all()
    serializer_class = SaidaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SaidaFilter

    def get_queryset(self):
        # Configure pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 10
        return super().get_queryset()
    
    def create(self, request, *args, **kwargs):
        """
        Cria uma nova saída com validação de estoque.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Validação de estoque disponível
        transacao_id = serializer.validated_data['transacao'].id_transacao
        
        try:
            transacao = Transacao.objects.get(id_transacao=transacao_id)
            qtd_saida = transacao.quantidade
            cod_sku = transacao.cod_sku
            
            # Use service to validate stock
            validation = TransactionService.validate_stock_availability(cod_sku, qtd_saida)
            
            if not validation['valid']:
                return Response(
                    {"detail": validation['message']},
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
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = FornecedorFilter

    def get_queryset(self):
        # Configure pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 10
        return super().get_queryset()


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar os usuários do sistema.
    """
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = UsuarioFilter
    
    def get_queryset(self):
        # Configure pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 10
        return Usuario.objects.all().select_related('auth_user')


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar usuários do sistema usando o modelo User do Django.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = UserFilter
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserDetailSerializer
    
    def get_queryset(self):
        # Configure pagination size
        self.pagination_class = PageNumberPagination
        self.pagination_class.page_size = 10
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
    try:
        # Use service to get or create inventory user
        usuario = UserService.get_or_create_inventory_user(request.user)
        
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
    
    # Use service to get unified transactions
    result = TransactionService.get_unified_transactions(
        date_from=date_from,
        date_to=date_to,
        nota_fiscal=nota_fiscal,
        sku=sku,
        description=description
    )
    
    return Response({'results': result})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_costs(request):
    """
    Recalcula os custos das transações subsequentes após uma modificação.
    """
    try:
        transaction_id = request.data.get('transactionId')
        sku = request.data.get('sku')
        
        if not transaction_id or not sku:
            return Response(
                {"detail": "transactionId e sku são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = TransactionService.recalculate_subsequent_costs(transaction_id, sku)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"detail": f"Erro ao recalcular custos: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_stock_operation(request):
    """
    Valida se uma operação manterá o estoque positivo.
    """
    try:
        sku = request.data.get('sku')
        operation_type = request.data.get('operationType')
        transaction_id = request.data.get('transactionId')
        new_quantity = request.data.get('newQuantity')
        
        if not sku or not operation_type:
            return Response(
                {"detail": "sku e operationType são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = TransactionService.validate_stock_after_operation(
            sku, operation_type, transaction_id, 
            Decimal(str(new_quantity)) if new_quantity else None
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"detail": f"Erro na validação: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_transaction(request, transaction_id):
    """
    Deleta uma transação com validação de estoque e recálculo de custos.
    """
    try:
        result = TransactionService.delete_transaction_with_validation(transaction_id)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"detail": f"Erro ao excluir transação: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_transaction(request, transaction_id):
    """
    Atualiza uma transação com validação de estoque e recálculo de custos.
    """
    try:
        new_data = request.data
        result = TransactionService.update_transaction_with_validation(transaction_id, new_data)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"detail": f"Erro ao atualizar transação: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
