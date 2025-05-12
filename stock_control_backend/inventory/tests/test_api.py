import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from inventory.models import Item, NotaFiscal, Usuario, Entrada, Saida
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
        cod_sku=9999,
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
def nota_fiscal(item):
    return NotaFiscal.objects.create(
        cod_nf="NF_ADV_001",
        cod_sku=item.cod_sku,
        quantidade=50,
        valor_unit="10.00"
    )

# =======================
# Testes para o recurso Item
# =======================

def test_create_item(authenticated_client):
    url = reverse('item-list')
    data = {
        "cod_sku": 12345,
        "descricao_item": "Molho de Tomate",
        "unid_medida": "kg"
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 201, f"Resposta: {response.json()}"
    assert Item.objects.filter(cod_sku=12345).exists()


def test_list_items(authenticated_client):
    Item.objects.create(cod_sku=1, descricao_item="Sal", unid_medida="kg")
    url = reverse('item-list')
    response = authenticated_client.get(url)
    assert response.status_code == 200
    data = response.json()
    items = data.get("results", data)
    assert any(i['descricao_item'] == "Sal" for i in items)


def test_duplicate_item_creation(authenticated_client, item):
    url = reverse('item-list')
    data = {
        "cod_sku": item.cod_sku,  # cod_sku duplicado
        "descricao_item": "Item duplicado",
        "unid_medida": "kg"
    }
    response = authenticated_client.post(url, data, format='json')
    expected_error = "Item with this cod sku already exists."
    error_msg = response.json().get("cod_sku", [""])[0]
    assert response.status_code == 400, f"Status retornado: {response.status_code}"
    assert expected_error in error_msg


def test_update_item(authenticated_client, item):
    url = reverse('item-detail', args=[item.cod_sku])
    data = {
        "cod_sku": item.cod_sku,
        "descricao_item": "Item Atualizado",
        "unid_medida": item.unid_medida
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
# Testes para o recurso Nota Fiscal
# =======================

def test_create_nota_fiscal(authenticated_client, item):
    url = reverse('notafiscal-list')
    data = {
        "cod_nf": "NF_TEST_123",
        "cod_sku": item.cod_sku,
        "quantidade": 30,
        "valor_unit": "12.99"
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 201
    assert NotaFiscal.objects.filter(cod_nf="NF_TEST_123").exists()


def test_invalid_nota_fiscal_creation(authenticated_client, item):
    url = reverse('notafiscal-list')
    data = {
        "cod_nf": "NF_ADV_INVALID",
        "cod_sku": item.cod_sku,
        # faltando o campo "quantidade"
        "valor_unit": "15.00"
    }
    response = authenticated_client.post(url, data, format='json')
    assert response.status_code == 400

# =======================
# Testes para o recurso Entrada
# =======================

def test_create_entrada(authenticated_client, usuario, nota_fiscal):
    url = reverse("entrada-list")
    data = {
         "cod_entrada": 111,
         "cod_nf": nota_fiscal.cod_nf,
         "mat_usuario": usuario.mat_usuario,
         "data_entrada": "2025-04-08",
         "hora_entrada": "15:30:00"
    }
    response = authenticated_client.post(url, data, format="json")
    assert response.status_code == 201, f"Response: {response.json()}"
    assert Entrada.objects.filter(cod_entrada=111).exists()

# =======================
# Testes para o recurso Saída
# =======================

def test_create_saida(authenticated_client, usuario, item):
    url = reverse("saida-list")
    data = {
         "cod_pedido": 222,
         "cod_sku": item.cod_sku,
         "qtd_saida": 5,
         "mat_usuario": usuario.mat_usuario,
         "data_saida": "2025-04-08",
         "hora_saida": "16:00:00"
    }
    response = authenticated_client.post(url, data, format="json")
    assert response.status_code == 201, f"Response: {response.json()}"
    assert Saida.objects.filter(cod_pedido=222).exists()


def test_invalid_saida(authenticated_client, usuario):
    url = reverse("saida-list")
    data = {
         "cod_pedido": 223,
         "cod_sku": 999999,  # item inexistente
         "qtd_saida": 10,
         "mat_usuario": usuario.mat_usuario,
         "data_saida": "2025-04-08",
         "hora_saida": "16:30:00"
    }
    response = authenticated_client.post(url, data, format="json")
    assert response.status_code == 400, f"Response: {response.json()}"

