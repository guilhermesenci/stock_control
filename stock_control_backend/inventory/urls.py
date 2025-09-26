from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransacaoViewSet,
    ItemViewSet,
    EntradaViewSet,
    SaidaViewSet,
    FornecedorViewSet,
    UsuarioViewSet,
    UserViewSet,
    RegisterView,
    get_current_user,
    get_current_user_inventory_info,
    StockViewSet,
    unified_transactions,
    recalculate_costs,
    validate_stock_operation,
    delete_transaction,
    update_transaction
)
from .api import StockCostViewSet

router = DefaultRouter()
router.register(r'transacoes', TransacaoViewSet, basename='transacao')
router.register(r'itens', ItemViewSet, basename='item')
router.register(r'entradas', EntradaViewSet, basename='entrada')
router.register(r'saidas', SaidaViewSet, basename='saida')
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'users', UserViewSet, basename='user')
router.register(r'stock-costs', StockCostViewSet, basename='stock-costs')
router.register(r'stocks', StockViewSet, basename='stocks')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('current-user-info/', get_current_user, name='current_user_info'),
    path('current-user-inventory-info/', get_current_user_inventory_info, name='current_user_inventory_info'),
    path('unified-transactions/', unified_transactions, name='unified_transactions'),
    
    # Novos endpoints para operações de transação
    path('recalculate-costs/', recalculate_costs, name='recalculate_costs'),
    path('validate-stock-operation/', validate_stock_operation, name='validate_stock_operation'),
    path('transactions/<str:transaction_id>/', delete_transaction, name='delete_transaction'),
    path('transactions/<str:transaction_id>/update/', update_transaction, name='update_transaction'),
]
