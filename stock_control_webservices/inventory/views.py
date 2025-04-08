from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import NotaFiscal, Item, Entrada, Saida, Fornecedor, Usuario
from .serializers import (
    NotaFiscalSerializer,
    ItemSerializer,
    EntradaSerializer,
    SaidaSerializer,
    FornecedorSerializer,
    UsuarioSerializer,
    UserRegistrationSerializer,
)
from rest_framework.response import Response
from rest_framework.views import APIView


class NotaFiscalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, atualizar e remover Notas Fiscais.
    """
    queryset = NotaFiscal.objects.all()
    serializer_class = NotaFiscalSerializer
    permission_classes = [IsAuthenticated]



class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, atualizar e remover Itens do estoque.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]


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


class FornecedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para cadastrar e gerenciar os fornecedores.
    """
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    permission_classes = [IsAuthenticated]


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
