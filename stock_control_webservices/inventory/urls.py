from django.urls import path, include
from rest_framework import routers
from .views import (
    NotaFiscalViewSet,
    ItemViewSet,
    EntradaViewSet,
    SaidaViewSet,
    FornecedorViewSet,
    UsuarioViewSet,
    RegisterView,
)

router = routers.DefaultRouter()
router.register(r'notas-fiscais', NotaFiscalViewSet, basename='notafiscal')
router.register(r'itens', ItemViewSet, basename='item')
router.register(r'entradas', EntradaViewSet, basename='entrada')
router.register(r'saidas', SaidaViewSet, basename='saida')
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
]
