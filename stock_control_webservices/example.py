import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def register_user(username, email, password):
    url = f"{BASE_URL}/api/vi/register/"
    payload = {
        "username": username,
        "email": email,
        "password": password,
        "password2": password
    }
    response = requests.post(url, json=payload)
    print("REGISTER RESPONSE:", response.status_code)
    print(response.json())
    return response


def obtain_token(username, password):
    url = f"{BASE_URL}/api/token/"
    payload = {
        "username": username,
        "password": password
    }
    response = requests.post(url, json=payload)
    print("TOKEN RESPONSE:", response.status_code)
    print(response.json())
    if response.status_code == 200:
        return response.json().get("access")
    return None


def create_item(token, cod_sku, descricao_item, unid_medida):
    url = f"{BASE_URL}/api/vi/itens/"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "cod_sku": cod_sku,
        "descricao_item": descricao_item,
        "unid_medida": unid_medida
    }
    response = requests.post(url, json=payload, headers=headers)
    print("CREATE ITEM RESPONSE:", response.status_code)
    print(response.json())
    return response


def list_items(token):
    url = f"{BASE_URL}/api/vi/itens/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    print("LIST ITEMS RESPONSE:", response.status_code)
    data = response.json()
    if "results" in data:
        print("Items:", data["results"])
    else:
        print("Items:", data)
    return response


def update_item(token, cod_sku, new_description, unid_medida):
    url = f"{BASE_URL}/api/vi/itens/{cod_sku}/"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "cod_sku": cod_sku,         # Incluído se o serializer exigir este campo como chave primária
        "descricao_item": new_description,
        "unid_medida": unid_medida
    }
    response = requests.put(url, json=payload, headers=headers)
    print("UPDATE ITEM RESPONSE:", response.status_code)
    print(response.json())
    return response


def delete_item(token, cod_sku):
    url = f"{BASE_URL}/api/vi/itens/{cod_sku}/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(url, headers=headers)
    print("DELETE ITEM RESPONSE:", response.status_code)
    if response.text:
        print(response.json())
    else:
        print("No content returned (expected for DELETE).")
    return response

def main():
    username = "jpafarelli"
    email = "jpafarelli@gmail.com"
    password = "0pr3SS@0"

    print("=== Registrando usuário ===")
    reg_response = register_user(username, email, password)

    print("\n=== Obtendo token JWT ===")
    token = obtain_token(username, password)
    if not token:
        print("Falha ao obter token, verifique se o usuário está registrado.")
        return

    print("\n=== Criando um item ===")
    create_item(token, cod_sku=1000, descricao_item="Test Product", unid_medida="pc")

    print("\n=== Listando itens ===")
    list_items(token)

    print("\n=== Atualizando o item ===")
    update_item(token, cod_sku=1000, new_description="Test Product Updated", unid_medida="pc")

    print("\n=== Deletando o item ===")
    delete_item(token, cod_sku=1000)


if __name__ == "__main__":
    main()
