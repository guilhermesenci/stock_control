# Arquitetura e Design Patterns - Stock Control Backend

## Visão Geral da Arquitetura

O Stock Control Backend segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, organizando o código em camadas bem definidas com responsabilidades claras.

## Estrutura de Camadas

```
┌─────────────────────────────────────┐
│           Presentation Layer        │  ← Views, Serializers, URLs
├─────────────────────────────────────┤
│           Business Layer            │  ← Services, Domain Logic
├─────────────────────────────────────┤
│           Data Access Layer         │  ← Models, Queries
├─────────────────────────────────────┤
│           Infrastructure Layer      │  ← Database, External APIs
└─────────────────────────────────────┘
```

## Padrões de Design Implementados

### 1. Service Layer Pattern

**Localização**: `inventory/services.py`

O padrão Service Layer centraliza a lógica de negócio, separando-a das views e models.

```python
class StockService:
    """Serviço para operações relacionadas ao estoque."""
    
    @staticmethod
    def calculate_stock_quantity(item: Item, stock_date: Optional[date] = None) -> Decimal:
        """Calcula a quantidade em estoque de um item."""
        # Lógica de negócio aqui
        pass
```

**Benefícios:**
- Reutilização de código
- Facilita testes unitários
- Separação clara de responsabilidades
- Manutenibilidade

### 2. Repository Pattern (Implícito)

**Localização**: Models com métodos customizados

Os models Django atuam como repositories, encapsulando consultas complexas:

```python
class Item(models.Model):
    # ... campos ...
    
    @property
    def stock_quantity(self) -> Decimal:
        """Calcula quantidade em estoque."""
        return StockService.calculate_stock_quantity(self)
    
    @property
    def average_cost(self) -> Decimal:
        """Calcula custo médio."""
        return StockService.calculate_average_cost(self)
```

### 3. Factory Pattern

**Localização**: `inventory/services.py` - UserService

```python
class UserService:
    @staticmethod
    def get_or_create_inventory_user(user_data: Dict[str, Any]) -> Usuario:
        """Factory method para criar usuários de inventário."""
        # Lógica de criação/atualização
        pass
```

### 4. Strategy Pattern

**Localização**: `inventory/filters.py`

Diferentes estratégias de filtragem implementadas através de Django Filter:

```python
class TransacaoFilter(django_filters.FilterSet):
    """Estratégias de filtragem para transações."""
    
    # Diferentes estratégias de filtro
    cod_sku = django_filters.CharFilter(field_name='cod_sku__cod_sku')
    data_range = django_filters.DateFromToRangeFilter(field_name='entradas__data_entrada')
```

### 5. Observer Pattern

**Localização**: `inventory/models.py` - Signals

```python
@receiver(post_save, sender=User)
def create_inventory_user(sender, instance, created, **kwargs):
    """Observer que cria usuário de inventário automaticamente."""
    if created:
        UserService.get_or_create_inventory_user(instance)
```

## Estrutura de Diretórios

```
stock_control_backend/
├── inventory/                    # App principal (Domain)
│   ├── models.py                # Entidades de domínio
│   ├── services.py              # Lógica de negócio
│   ├── serializers.py           # DTOs e conversão de dados
│   ├── views.py                 # Controllers
│   ├── filters.py               # Estratégias de filtragem
│   ├── api.py                   # APIs específicas
│   ├── utils.py                 # Utilitários de domínio
│   ├── backends.py              # Autenticação customizada
│   ├── middleware.py            # Middleware de domínio
│   ├── urls.py                  # Roteamento
│   └── tests/                   # Testes de domínio
├── stock_control_backend/       # Configurações (Infrastructure)
│   ├── settings.py              # Configurações
│   ├── urls.py                  # Roteamento principal
│   ├── wsgi.py                  # Interface WSGI
│   └── asgi.py                  # Interface ASGI
└── docs/                        # Documentação
```

## Princípios de Design

### 1. Single Responsibility Principle (SRP)

Cada classe tem uma única responsabilidade:

- **Models**: Estrutura de dados e validações básicas
- **Services**: Lógica de negócio
- **Views**: Controle de requisições HTTP
- **Serializers**: Conversão de dados

### 2. Open/Closed Principle (OCP)

O sistema é aberto para extensão, fechado para modificação:

```python
# Extensível através de herança
class BaseStockService:
    def calculate_cost(self, item):
        pass

class FIFOStockService(BaseStockService):
    def calculate_cost(self, item):
        # Implementação FIFO
        pass

class LIFOStockService(BaseStockService):
    def calculate_cost(self, item):
        # Implementação LIFO
        pass
```

### 3. Dependency Inversion Principle (DIP)

Dependências são injetadas, não criadas internamente:

```python
class TransactionService:
    def __init__(self, stock_service: StockService):
        self.stock_service = stock_service
    
    def validate_stock_availability(self, item, quantity):
        current_stock = self.stock_service.calculate_stock_quantity(item)
        return current_stock >= quantity
```

## Padrões de Dados

### 1. Active Record Pattern

Os models Django seguem o padrão Active Record:

```python
# O model contém tanto dados quanto comportamento
item = Item.objects.get(cod_sku='ITEM001')
stock = item.stock_quantity  # Comportamento no model
item.save()  # Persistência no model
```

### 2. Data Transfer Object (DTO)

Serializers atuam como DTOs:

```python
class TransacaoSerializer(serializers.ModelSerializer):
    """DTO para transferência de dados de transação."""
    
    valor_total = serializers.ReadOnlyField()
    is_entrada = serializers.ReadOnlyField()
    is_saida = serializers.ReadOnlyField()
```

### 3. Value Objects

Campos calculados como value objects:

```python
class Item(models.Model):
    @property
    def stock_quantity(self) -> Decimal:
        """Value object para quantidade em estoque."""
        return StockService.calculate_stock_quantity(self)
```

## Padrões de Comunicação

### 1. RESTful API

Endpoints seguem convenções REST:

```
GET    /api/transacoes/          # Listar
POST   /api/transacoes/          # Criar
GET    /api/transacoes/{id}/     # Obter
PUT    /api/transacoes/{id}/     # Atualizar
DELETE /api/transacoes/{id}/     # Deletar
```

### 2. JSON API

Respostas padronizadas em JSON:

```json
{
    "count": 100,
    "next": "http://api/transacoes/?page=2",
    "previous": null,
    "results": [...]
}
```

### 3. JWT Authentication

Autenticação stateless com JWT:

```python
# Configuração JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

## Padrões de Tratamento de Erros

### 1. Exception Handling

Tratamento centralizado de exceções:

```python
class StockInsufficientException(Exception):
    """Exceção para estoque insuficiente."""
    pass

class TransactionService:
    def validate_stock_availability(self, item, quantity):
        if not self._has_sufficient_stock(item, quantity):
            raise StockInsufficientException(
                f"Estoque insuficiente para {item.cod_sku}"
            )
```

### 2. Error Response Pattern

Respostas de erro padronizadas:

```json
{
    "error": "Estoque insuficiente",
    "details": {
        "cod_sku": "ITEM001",
        "available_stock": 50.00,
        "requested_quantity": 100.00
    }
}
```

## Padrões de Performance

### 1. Lazy Loading

Carregamento sob demanda:

```python
# Query otimizada com select_related
transacoes = Transacao.objects.select_related(
    'cod_sku', 'cod_fornecedor'
).prefetch_related('entradas', 'saidas')
```

### 2. Caching Strategy

Cache em múltiplas camadas:

```python
# Cache de queries frequentes
@cache_page(60 * 15)  # 15 minutos
def get_stock_info(request):
    return StockViewSet.list(request)
```

### 3. Database Optimization

Índices otimizados:

```python
class Transacao(models.Model):
    cod_nf = models.CharField(max_length=50, db_index=True)
    cod_sku = models.ForeignKey('Item', db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['cod_sku', 'cod_nf']),
            models.Index(fields=['cod_fornecedor', 'cod_sku']),
        ]
```

## Padrões de Teste

### 1. Test Pyramid

Estrutura de testes em pirâmide:

```
    /\
   /  \     E2E Tests (Poucos)
  /____\
 /      \   Integration Tests (Alguns)
/________\
          Unit Tests (Muitos)
```

### 2. AAA Pattern

Arrange, Act, Assert:

```python
def test_calculate_stock_quantity(self):
    # Arrange
    item = Item.objects.create(cod_sku='ITEM001')
    Transacao.objects.create(cod_sku=item, quantidade=100)
    
    # Act
    stock = StockService.calculate_stock_quantity(item)
    
    # Assert
    self.assertEqual(stock, Decimal('100.00'))
```

### 3. Mock Pattern

Isolamento de dependências:

```python
@patch('inventory.services.StockService.calculate_stock_quantity')
def test_transaction_validation(self, mock_calculate):
    # Arrange
    mock_calculate.return_value = Decimal('50.00')
    
    # Act & Assert
    # Teste isolado
```

## Padrões de Segurança

### 1. Authentication & Authorization

```python
# Autenticação JWT
class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Validação de token
        pass

# Autorização baseada em permissões
class TransacaoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
```

### 2. Input Validation

```python
class TransacaoSerializer(serializers.ModelSerializer):
    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantidade deve ser maior que zero"
            )
        return value
```

### 3. SQL Injection Prevention

Uso de ORM Django (proteção automática):

```python
# Seguro - usa ORM
Transacao.objects.filter(cod_sku=sku)

# Inseguro - SQL direto (não usado)
# Transacao.objects.raw(f"SELECT * FROM transacao WHERE cod_sku = '{sku}'")
```

## Padrões de Monitoramento

### 1. Logging Strategy

```python
import logging

logger = logging.getLogger(__name__)

class StockService:
    def calculate_stock_quantity(self, item):
        logger.info(f"Calculando estoque para item {item.cod_sku}")
        try:
            # Cálculo
            logger.info(f"Estoque calculado: {result}")
            return result
        except Exception as e:
            logger.error(f"Erro ao calcular estoque: {e}")
            raise
```

### 2. Metrics Collection

```python
# Métricas de performance
from django.db import connection

def get_query_count():
    return len(connection.queries)

# Middleware para métricas
class MetricsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time
        
        # Log métricas
        logger.info(f"Request {request.path} took {duration}s")
        return response
```

## Evolução da Arquitetura

### Próximos Passos

1. **CQRS (Command Query Responsibility Segregation)**
   - Separar comandos de consultas
   - Otimizar para leitura e escrita

2. **Event Sourcing**
   - Armazenar eventos de transação
   - Reconstruir estado a partir de eventos

3. **Microservices**
   - Separar por domínio
   - APIs independentes

4. **Message Queue**
   - Processamento assíncrono
   - Integração entre serviços

### Considerações de Escalabilidade

- **Horizontal Scaling**: Stateless design
- **Database Sharding**: Por região/fornecedor
- **Caching**: Redis para dados frequentes
- **CDN**: Para assets estáticos
- **Load Balancing**: Distribuição de carga

## Conclusão

A arquitetura atual fornece uma base sólida e escalável para o sistema de controle de estoque. Os padrões implementados facilitam manutenção, testes e evolução do sistema, seguindo as melhores práticas de desenvolvimento de software.

