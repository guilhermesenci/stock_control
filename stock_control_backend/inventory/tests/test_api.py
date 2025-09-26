import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from inventory.models import Item, Fornecedor, Usuario, Transacao, Entrada, Saida
from django.contrib.auth.models import User

pytestmark = pytest.mark.django_db

# Fixture autenticada para garantir que as views protegidas sejam acessíveis
@pytest.fixture
def authenticated_client(db):
    user = User.objects.create_user(username='testuser', password='testpass')
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def item():
    return Item.objects.create(
        cod_sku="TEST001",
        descricao_item="Test Item",
        unid_medida="units"
    )


@pytest.fixture
def usuario():
    return Usuario.objects.create(
        mat_usuario=100,
        nome_usuario="Test User"
    )


@pytest.fixture
def fornecedor():
    return Fornecedor.objects.create(
        nome_fornecedor="Test Supplier"
    )


@pytest.fixture
def transacao(item, fornecedor):
    return Transacao.objects.create(
        cod_nf="NF_TEST_001",
        cod_sku=item,
        quantidade=Decimal("50.00"),
        valor_unit=Decimal("10.00"),
        cod_fornecedor=fornecedor
    )

# =======================
# Testes para o recurso Item
# =======================

def test_create_item(authenticated_client):
    url = reverse('item-list')
    data = {
        "codSku": "ITEM12345",
        "descricaoItem": "Molho de Tomate",
        "unidMedida": "kg"
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 201, f"Resposta: {response.json()}"
    assert Item.objects.filter(cod_sku="ITEM12345").exists()


def test_list_items(authenticated_client):
    Item.objects.create(cod_sku="SAL001", descricao_item="Sal", unid_medida="kg")
    url = reverse('item-list')
    response = authenticated_client.get(url)
    assert response.status_code == 200
    data = response.json()
    items = data.get("results", data)
    assert any(i['descricaoItem'] == "Sal" for i in items)


def test_duplicate_item_creation(authenticated_client, item):
    url = reverse('item-list')
    data = {
        "codSku": item.cod_sku,  # cod_sku duplicado
        "descricaoItem": "Item duplicado",
        "unidMedida": "kg"
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 400, f"Status retornado: {response.status_code}"
    # Verificar se há erro de duplicação
    assert "codSku" in response.json() or "cod_sku" in response.json()


def test_update_item(authenticated_client, item):
    url = reverse('item-detail', args=[item.cod_sku])
    data = {
        "codSku": item.cod_sku,
        "descricaoItem": "Item Atualizado",
        "unidMedida": item.unid_medida
    }
    response = authenticated_client.put(url, data, format='json')
    assert response.status_code == 200, f"Response: {response.json()}"
    item.refresh_from_db()
    assert item.descricao_item == "Item Atualizado"


def test_delete_item(authenticated_client, item):
    url = reverse('item-detail', args=[item.cod_sku])
    response = authenticated_client.delete(url)
    assert response.status_code == 204
    with pytest.raises(Item.DoesNotExist):
        Item.objects.get(cod_sku=item.cod_sku)

# =======================
# Testes para o recurso Fornecedor
# =======================

def test_create_fornecedor(authenticated_client):
    url = reverse('fornecedor-list')
    data = {
        "nomeFornecedor": "Fornecedor Teste",
        "active": True
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 201, f"Resposta: {response.json()}"
    assert Fornecedor.objects.filter(nome_fornecedor="Fornecedor Teste").exists()


def test_list_fornecedores(authenticated_client):
    Fornecedor.objects.create(nome_fornecedor="Fornecedor Lista", active=True)
    url = reverse('fornecedor-list')
    response = authenticated_client.get(url)
    assert response.status_code == 200
    data = response.json()
    fornecedores = data.get("results", data)
    assert any(f['nomeFornecedor'] == "Fornecedor Lista" for f in fornecedores)


# =======================
# Testes para o recurso Transação
# =======================

def test_create_transacao(authenticated_client, item, fornecedor):
    url = reverse('transacao-list')
    data = {
        "codNf": "NF_TRANS_TEST",
        "codSku": item.cod_sku,
        "quantidade": "25.50",
        "valorUnit": "15.99",
        "codFornecedor": fornecedor.cod_fornecedor
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 201, f"Resposta: {response.json()}"
    assert Transacao.objects.filter(cod_nf="NF_TRANS_TEST").exists()


def test_create_transacao_without_fornecedor(authenticated_client, item):
    url = reverse('transacao-list')
    data = {
        "codNf": "NF_NO_SUPPLIER",
        "codSku": item.cod_sku,
        "quantidade": "10.00",
        "valorUnit": "20.00"
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 201, f"Resposta: {response.json()}"
    transacao = Transacao.objects.get(cod_nf="NF_NO_SUPPLIER")
    assert transacao.cod_fornecedor is None


# =======================
# Testes para o recurso Entrada
# =======================

def test_create_entrada(authenticated_client, usuario, transacao):
    url = reverse("entrada-list")
    data = {
        "transacao": transacao.id_transacao,
        "matUsuario": usuario.mat_usuario,
        "dataEntrada": "2024-01-15",
        "horaEntrada": "15:30:00"
    }
    response = authenticated_client.post(url, data, format="json")
    assert response.status_code == 201, f"Response: {response.json()}"
    assert Entrada.objects.filter(transacao=transacao).exists()


# =======================
# Testes para o recurso Saída
# =======================

def test_create_saida(authenticated_client, usuario, transacao):
    # Primeiro criar uma entrada para ter estoque disponível
    Entrada.objects.create(
        transacao=transacao,
        mat_usuario=usuario,
        data_entrada="2024-01-15",
        hora_entrada="10:00:00"
    )
    
    # Agora criar uma nova transação para saída
    transacao_saida = Transacao.objects.create(
        cod_nf="NF_SAI_TEST",
        cod_sku=transacao.cod_sku,
        quantidade=Decimal("10.00"),
        valor_unit=Decimal("15.00")
    )
    
    url = reverse("saida-list")
    data = {
        "transacao": transacao_saida.id_transacao,
        "matUsuario": usuario.mat_usuario,
        "dataSaida": "2024-01-16",
        "horaSaida": "16:00:00"
    }
    response = authenticated_client.post(url, data, format="json")
    assert response.status_code == 201, f"Response: {response.json()}"
    assert Saida.objects.filter(transacao=transacao_saida).exists()


# =======================
# Testes para o recurso Usuário
# =======================

def test_list_usuarios(authenticated_client):
    Usuario.objects.create(mat_usuario=999, nome_usuario="Usuário Lista")
    url = reverse('usuario-list')
    response = authenticated_client.get(url)
    assert response.status_code == 200
    data = response.json()
    usuarios = data.get("results", data)
    assert any(u['nomeUsuario'] == "Usuário Lista" for u in usuarios)


def test_create_usuario(authenticated_client):
    url = reverse('usuario-list')
    data = {
        "matUsuario": 888,
        "nomeUsuario": "Usuário Criado"
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 201, f"Resposta: {response.json()}"
    assert Usuario.objects.filter(mat_usuario=888).exists()

