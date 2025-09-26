# Stock Control Backend

Sistema de controle de estoque desenvolvido em Django REST Framework com arquitetura limpa e escalável.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.2-green.svg)](https://djangoproject.com)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.16.0-red.svg)](https://www.django-rest-framework.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Características

- **API REST** completa com Django REST Framework
- **Autenticação JWT** para segurança
- **Arquitetura limpa** com separação de responsabilidades
- **Cálculos automáticos** de estoque e custos
- **Filtros avançados** e paginação
- **Testes abrangentes** com alta cobertura
- **Documentação completa** da API
- **Deploy fácil** com Docker e scripts automatizados

## 📋 Funcionalidades

### Gestão de Estoque
- ✅ Controle de entradas e saídas
- ✅ Cálculo automático de quantidade em estoque
- ✅ Cálculo de custo médio ponderado
- ✅ Estimativa de tempo de consumo
- ✅ Alertas de estoque baixo

### Gestão de Itens
- ✅ Cadastro de produtos com SKU
- ✅ Categorização e descrições
- ✅ Controle de unidades de medida
- ✅ Status ativo/inativo

### Gestão de Fornecedores
- ✅ Cadastro completo de fornecedores
- ✅ Controle de CNPJ e dados fiscais
- ✅ Histórico de transações por fornecedor

### Relatórios e Consultas
- ✅ Transações unificadas (entradas + saídas)
- ✅ Relatórios de custos de estoque
- ✅ Filtros avançados por data, item, fornecedor
- ✅ Exportação de dados

## 🏗️ Estrutura do Projeto

```
stock_control_backend/
├── inventory/                    # App principal do sistema
│   ├── models.py                # Modelos de dados (Entidades)
│   ├── views.py                 # Views e ViewSets (Controllers)
│   ├── serializers.py           # Serializers (DTOs)
│   ├── services.py              # Lógica de negócio (Services)
│   ├── filters.py               # Filtros para API
│   ├── utils.py                 # Utilitários
│   ├── api.py                   # APIs específicas
│   ├── urls.py                  # URLs da app
│   ├── backends.py              # Backends de autenticação
│   ├── middleware.py            # Middleware customizado
│   ├── tests/                   # Testes automatizados
│   └── management/              # Comandos de gerenciamento
├── stock_control_backend/       # Configurações do projeto
│   ├── settings.py              # Configurações
│   ├── urls.py                  # URLs principais
│   ├── wsgi.py                  # WSGI
│   └── asgi.py                  # ASGI
├── docs/                        # Documentação
│   ├── API.md                   # Documentação da API
│   ├── ARCHITECTURE.md          # Arquitetura e padrões
│   ├── DEPLOYMENT.md            # Guia de deploy
│   └── CONTRIBUTING.md          # Guia de contribuição
└── requirements.txt             # Dependências
```

## Principais Melhorias Implementadas

### 1. Separação de Responsabilidades

- **Models**: Adicionados métodos úteis e propriedades para cálculos de estoque
- **Services**: Criado módulo `services.py` com lógica de negócio separada das views
- **Views**: Simplificadas para focar apenas na lógica de apresentação
- **Serializers**: Mantidos com funcionalidades de conversão camelCase/snake_case

### 2. Serviços Criados

#### StockService
- `calculate_stock_quantity()`: Calcula quantidade em estoque
- `calculate_average_cost()`: Calcula custo médio
- `get_last_entry_cost()`: Obtém custo da última entrada
- `calculate_consumption_estimate()`: Estima tempo de consumo
- `get_stock_items()`: Lista itens com informações de estoque

#### TransactionService
- `validate_stock_availability()`: Valida disponibilidade de estoque
- `get_unified_transactions()`: Obtém transações unificadas

#### UserService
- `get_or_create_inventory_user()`: Gerencia usuários de inventário

### 3. Melhorias nos Models

- Adicionados docstrings explicativos
- Propriedades úteis (`valor_total`, `is_entrada`, `is_saida`)
- Métodos para cálculos de estoque e custos
- Verbose names para campos
- Índices otimizados

### 4. Refatoração das Views

- Código duplicado removido
- Lógica de negócio movida para serviços
- Views mais limpas e focadas
- Melhor tratamento de erros

### 5. Filtros Otimizados

- Removida duplicação de campos
- Suporte a snake_case e camelCase
- Documentação clara dos filtros

### 6. Configurações Melhoradas

- Configurações organizadas por seções
- Variáveis de ambiente para configuração
- Logging configurado adequadamente
- CORS configurável via ambiente
- JWT configurado com mais opções

## 🚀 Início Rápido

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/stock-control-backend.git
   cd stock-control-backend
   ```

2. **Configure o ambiente virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate     # Windows
   ```

3. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

   Exemplo de `.env`:
   ```env
   SECRET_KEY=sua_chave_secreta_super_segura_aqui
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Execute as migrações**
   ```bash
   python manage.py migrate
   ```

6. **Crie um superusuário**
   ```bash
   python manage.py createsuperuser
   ```

7. **Execute o servidor**
   ```bash
   python manage.py runserver
   ```

8. **Acesse a API**
   - API: http://localhost:8000/api/
   - Admin: http://localhost:8000/admin/
   - Documentação: http://localhost:8000/api/docs/

### 🐳 Deploy com Docker

```bash
# Clone e configure
git clone https://github.com/seu-usuario/stock-control-backend.git
cd stock-control-backend

# Execute com Docker Compose
docker-compose up -d

# Execute migrações
docker-compose exec web python manage.py migrate

# Crie superusuário
docker-compose exec web python manage.py createsuperuser
```

## 📖 Exemplos de Uso

### Autenticação

```bash
# Obter token JWT
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "seu_usuario", "password": "sua_senha"}'

# Usar token nas requisições
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:8000/api/transacoes/
```

### Criar um Item

```bash
curl -X POST http://localhost:8000/api/itens/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "cod_sku": "PROD001",
    "nome": "Produto Exemplo",
    "descricao": "Descrição do produto",
    "unidade": "UN"
  }'
```

### Registrar uma Entrada

```bash
curl -X POST http://localhost:8000/api/transacoes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "cod_nf": "NF001",
    "cod_sku": "PROD001",
    "quantidade": 100.00,
    "valor_unit": 25.50,
    "cod_fornecedor": 1
  }'
```

### Consultar Estoque

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:8000/api/stocks/?cod_sku=PROD001
```

### Filtrar Transações

```bash
# Por item
curl -H "Authorization: Bearer SEU_TOKEN" \
  "http://localhost:8000/api/transacoes/?cod_sku=PROD001"

# Por período
curl -H "Authorization: Bearer SEU_TOKEN" \
  "http://localhost:8000/api/transacoes/?data_inicio=2024-01-01&data_fim=2024-01-31"

# Com paginação
curl -H "Authorization: Bearer SEU_TOKEN" \
  "http://localhost:8000/api/transacoes/?page=1&page_size=20"
```

### Python SDK (Exemplo)

```python
import requests

class StockControlAPI:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.token = self._get_token(username, password)
        self.headers = {'Authorization': f'Bearer {self.token}'}
    
    def _get_token(self, username, password):
        response = requests.post(f'{self.base_url}/api/token/', {
            'username': username,
            'password': password
        })
        return response.json()['access']
    
    def get_stock(self, cod_sku):
        response = requests.get(
            f'{self.base_url}/api/stocks/?cod_sku={cod_sku}',
            headers=self.headers
        )
        return response.json()
    
    def create_transaction(self, data):
        response = requests.post(
            f'{self.base_url}/api/transacoes/',
            json=data,
            headers=self.headers
        )
        return response.json()

# Uso
api = StockControlAPI('http://localhost:8000', 'usuario', 'senha')
stock = api.get_stock('PROD001')
print(f"Estoque atual: {stock['results'][0]['stock_quantity']}")
```

### Endpoints Principais

- `/api/transacoes/` - CRUD de transações
- `/api/itens/` - CRUD de itens
- `/api/entradas/` - CRUD de entradas
- `/api/saidas/` - CRUD de saídas
- `/api/fornecedores/` - CRUD de fornecedores
- `/api/usuarios/` - CRUD de usuários
- `/api/stocks/` - Informações de estoque
- `/api/stock-costs/` - Custos de estoque
- `/api/unified-transactions/` - Transações unificadas

### Autenticação

O sistema usa JWT para autenticação. Para obter um token:

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "seu_usuario", "password": "sua_senha"}'
```

Use o token retornado no header `Authorization: Bearer <token>`.

## Desenvolvimento

### Estrutura de Código

- **Models**: Definem a estrutura de dados
- **Services**: Contêm a lógica de negócio
- **Views**: Gerenciam requisições HTTP
- **Serializers**: Convertem dados entre formatos
- **Filters**: Filtram dados da API

### Adicionando Novos Recursos

1. **Model**: Adicione o modelo em `models.py`
2. **Service**: Crie métodos de serviço em `services.py`
3. **Serializer**: Crie serializers em `serializers.py`
4. **View**: Crie views em `views.py`
5. **URL**: Adicione URLs em `urls.py`

### Testes

Execute os testes com:
```bash
python manage.py test
```

## 📚 Documentação

- **[API Documentation](docs/API.md)** - Documentação completa da API com exemplos
- **[Architecture Guide](docs/ARCHITECTURE.md)** - Arquitetura e padrões de design
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Guia de deploy para diferentes ambientes
- **[Contributing Guide](docs/CONTRIBUTING.md)** - Como contribuir com o projeto

## 🧪 Testes

```bash
# Executar todos os testes
python manage.py test

# Executar com cobertura
pytest --cov=inventory --cov-report=html

# Executar testes específicos
python manage.py test inventory.tests.test_services
```

## 🔧 Comandos Úteis

```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic

# Criar superusuário
python manage.py createsuperuser

# Shell interativo
python manage.py shell

# Comando customizado
python manage.py create_usuarios
```

## 🚀 Deploy

### Desenvolvimento
```bash
python manage.py runserver
```

### Produção
```bash
# Com Gunicorn
gunicorn stock_control_backend.wsgi:application

# Com Docker
docker-compose up -d
```

Veja o [Guia de Deploy](docs/DEPLOYMENT.md) para instruções detalhadas.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o [Guia de Contribuição](docs/CONTRIBUTING.md) antes de começar.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📊 Status do Projeto

- ✅ **API REST** - Completa e funcional
- ✅ **Autenticação JWT** - Implementada
- ✅ **Testes** - Cobertura > 80%
- ✅ **Documentação** - Completa
- ✅ **Deploy** - Scripts automatizados
- 🔄 **Frontend** - Em desenvolvimento
- 📋 **Roadmap** - Veja issues para próximas features

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, abra uma [issue](https://github.com/seu-usuario/stock-control-backend/issues) com:

- Descrição detalhada do problema
- Steps para reproduzir
- Ambiente (OS, Python, Django versões)
- Logs de erro (se houver)

## 💡 Sugestões

Tem uma ideia para melhorar o projeto? Abra uma [issue](https://github.com/seu-usuario/stock-control-backend/issues) com a label "enhancement".

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial* - [seu-github](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Django REST Framework
- Comunidade Python
- Todos os contribuidores

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**
