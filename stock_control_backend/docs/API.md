# API Documentation - Stock Control Backend

## Visão Geral

O Stock Control Backend é uma API REST desenvolvida em Django REST Framework para gerenciamento de estoque. A API fornece endpoints para controle de itens, transações, fornecedores e usuários.

**Base URL**: `http://localhost:8000/api/`

## Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. Todos os endpoints protegidos requerem um token válido no header `Authorization`.

### Obter Token

```bash
POST /api/token/
Content-Type: application/json

{
    "username": "seu_usuario",
    "password": "sua_senha"
}
```

**Resposta:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Usar Token

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Endpoints

### 1. Transações

#### Listar Transações
```bash
GET /api/transacoes/
```

**Parâmetros de Query:**
- `cod_sku`: Filtrar por código SKU
- `cod_fornecedor`: Filtrar por fornecedor
- `data_inicio`: Data de início (YYYY-MM-DD)
- `data_fim`: Data de fim (YYYY-MM-DD)
- `page`: Número da página
- `page_size`: Tamanho da página

**Exemplo:**
```bash
GET /api/transacoes/?cod_sku=ITEM001&page=1&page_size=20
```

**Resposta:**
```json
{
    "count": 150,
    "next": "http://localhost:8000/api/transacoes/?page=2",
    "previous": null,
    "results": [
        {
            "id_transacao": 1,
            "cod_nf": "NF001",
            "cod_sku": "ITEM001",
            "quantidade": 100.00,
            "valor_unit": 25.50,
            "cod_fornecedor": 1,
            "valor_total": 2550.00,
            "is_entrada": true,
            "is_saida": false
        }
    ]
}
```

#### Criar Transação
```bash
POST /api/transacoes/
Content-Type: application/json
Authorization: Bearer <token>

{
    "cod_nf": "NF002",
    "cod_sku": "ITEM001",
    "quantidade": 50.00,
    "valor_unit": 30.00,
    "cod_fornecedor": 1
}
```

#### Atualizar Transação
```bash
PUT /api/transacoes/{id}/
PATCH /api/transacoes/{id}/
```

#### Deletar Transação
```bash
DELETE /api/transacoes/{id}/
```

### 2. Itens

#### Listar Itens
```bash
GET /api/itens/
```

**Parâmetros de Query:**
- `search`: Busca por nome ou código
- `active`: Filtrar por status ativo (true/false)
- `page`: Número da página
- `page_size`: Tamanho da página

**Exemplo:**
```bash
GET /api/itens/?search=produto&active=true
```

**Resposta:**
```json
{
    "count": 25,
    "next": null,
    "previous": null,
    "results": [
        {
            "cod_sku": "ITEM001",
            "nome": "Produto Exemplo",
            "descricao": "Descrição do produto",
            "unidade": "UN",
            "active": true,
            "stock_quantity": 150.00,
            "average_cost": 27.50,
            "last_entry_cost": 30.00
        }
    ]
}
```

#### Criar Item
```bash
POST /api/itens/
Content-Type: application/json
Authorization: Bearer <token>

{
    "cod_sku": "ITEM002",
    "nome": "Novo Produto",
    "descricao": "Descrição do novo produto",
    "unidade": "UN"
}
```

### 3. Entradas

#### Listar Entradas
```bash
GET /api/entradas/
```

**Parâmetros de Query:**
- `cod_sku`: Filtrar por item
- `cod_fornecedor`: Filtrar por fornecedor
- `data_entrada`: Filtrar por data de entrada
- `page`: Número da página

**Resposta:**
```json
{
    "count": 50,
    "next": null,
    "previous": null,
    "results": [
        {
            "id_entrada": 1,
            "transacao": {
                "id_transacao": 1,
                "cod_nf": "NF001",
                "cod_sku": "ITEM001",
                "quantidade": 100.00,
                "valor_unit": 25.50,
                "cod_fornecedor": 1
            },
            "data_entrada": "2024-01-15",
            "observacoes": "Entrada de estoque"
        }
    ]
}
```

### 4. Saídas

#### Listar Saídas
```bash
GET /api/saidas/
```

**Parâmetros similares às entradas**

### 5. Fornecedores

#### Listar Fornecedores
```bash
GET /api/fornecedores/
```

**Parâmetros de Query:**
- `search`: Busca por nome
- `active`: Filtrar por status ativo

**Resposta:**
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "cod_fornecedor": 1,
            "nome": "Fornecedor Exemplo",
            "cnpj": "12.345.678/0001-90",
            "endereco": "Rua Exemplo, 123",
            "telefone": "(11) 99999-9999",
            "email": "contato@fornecedor.com",
            "active": true
        }
    ]
}
```

### 6. Estoque

#### Informações de Estoque
```bash
GET /api/stocks/
```

**Parâmetros de Query:**
- `cod_sku`: Filtrar por item específico
- `low_stock`: Mostrar apenas itens com estoque baixo

**Resposta:**
```json
{
    "count": 25,
    "next": null,
    "previous": null,
    "results": [
        {
            "cod_sku": "ITEM001",
            "nome": "Produto Exemplo",
            "stock_quantity": 150.00,
            "average_cost": 27.50,
            "last_entry_cost": 30.00,
            "consumption_estimate_days": 45,
            "total_value": 4125.00
        }
    ]
}
```

### 7. Custos de Estoque

#### Custos de Estoque
```bash
GET /api/stock-costs/
```

**Resposta:**
```json
{
    "count": 25,
    "next": null,
    "previous": null,
    "results": [
        {
            "cod_sku": "ITEM001",
            "nome": "Produto Exemplo",
            "stock_quantity": 150.00,
            "average_cost": 27.50,
            "total_cost": 4125.00,
            "last_entry_cost": 30.00,
            "last_entry_date": "2024-01-15"
        }
    ]
}
```

### 8. Transações Unificadas

#### Transações Unificadas
```bash
GET /api/unified-transactions/
```

**Parâmetros de Query:**
- `cod_sku`: Filtrar por item
- `tipo`: Filtrar por tipo (entrada/saida)
- `data_inicio`: Data de início
- `data_fim`: Data de fim
- `page`: Número da página

**Resposta:**
```json
{
    "count": 100,
    "next": "http://localhost:8000/api/unified-transactions/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "tipo": "entrada",
            "cod_sku": "ITEM001",
            "nome_item": "Produto Exemplo",
            "quantidade": 100.00,
            "valor_unit": 25.50,
            "valor_total": 2550.00,
            "data": "2024-01-15",
            "cod_fornecedor": 1,
            "nome_fornecedor": "Fornecedor Exemplo",
            "cod_nf": "NF001",
            "observacoes": "Entrada de estoque"
        }
    ]
}
```

### 9. Usuários

#### Listar Usuários
```bash
GET /api/usuarios/
```

#### Criar Usuário
```bash
POST /api/usuarios/
Content-Type: application/json
Authorization: Bearer <token>

{
    "username": "novo_usuario",
    "email": "usuario@exemplo.com",
    "password": "senha123",
    "first_name": "Nome",
    "last_name": "Sobrenome"
}
```

### 10. Endpoints Especiais

#### Recalcular Custos
```bash
POST /api/recalculate-costs/
Authorization: Bearer <token>
```

#### Validar Operação de Estoque
```bash
POST /api/validate-stock-operation/
Content-Type: application/json
Authorization: Bearer <token>

{
    "cod_sku": "ITEM001",
    "quantidade": 50.00,
    "tipo": "saida"
}
```

#### Informações do Usuário Atual
```bash
GET /api/current-user-info/
Authorization: Bearer <token>
```

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido ou ausente
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Paginação

Todos os endpoints de listagem suportam paginação:

- `page`: Número da página (padrão: 1)
- `page_size`: Tamanho da página (padrão: 20, máximo: 100)

**Exemplo de resposta paginada:**
```json
{
    "count": 150,
    "next": "http://localhost:8000/api/transacoes/?page=2",
    "previous": null,
    "results": [...]
}
```

## Filtros

A maioria dos endpoints suporta filtros específicos. Consulte a documentação de cada endpoint para ver os filtros disponíveis.

## Ordenação

Alguns endpoints suportam ordenação usando o parâmetro `ordering`:

```bash
GET /api/transacoes/?ordering=-data_entrada  # Ordenar por data decrescente
GET /api/itens/?ordering=nome                # Ordenar por nome crescente
```

## Tratamento de Erros

### Formato de Erro
```json
{
    "error": "Mensagem de erro",
    "details": {
        "field_name": ["Erro específico do campo"]
    }
}
```

### Exemplos de Erros Comuns

**400 - Dados Inválidos:**
```json
{
    "cod_sku": ["Este campo é obrigatório."],
    "quantidade": ["Certifique-se de que este valor seja maior que 0."]
}
```

**401 - Não Autorizado:**
```json
{
    "detail": "Token de autenticação não fornecido."
}
```

**404 - Não Encontrado:**
```json
{
    "detail": "Não encontrado."
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:
- 1000 requisições por hora por IP
- 100 requisições por minuto por usuário autenticado

## Versionamento

A API atual é a versão 1.0. Mudanças que quebram compatibilidade serão implementadas em novas versões.

## Suporte

Para suporte técnico ou dúvidas sobre a API, entre em contato com a equipe de desenvolvimento.

