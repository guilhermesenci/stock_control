from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransacaoViewSet,
    ItemViewSet,
    EntradaViewSet,
    SaidaViewSet,
    FornecedorViewSet,
    UsuarioViewSet,
    RegisterView,
    get_current_usuario,
    StockViewSet
)
from .api import StockCostViewSet

router = DefaultRouter()
router.register(r'transacoes', TransacaoViewSet, basename='transacao')
router.register(r'itens', ItemViewSet, basename='item')
router.register(r'entradas', EntradaViewSet, basename='entrada')
router.register(r'saidas', SaidaViewSet, basename='saida')
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'stock-costs', StockCostViewSet, basename='stock-costs')
router.register(r'stocks', StockViewSet, basename='stocks')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('current-user-info/', get_current_usuario, name='current_user_info'),
]
