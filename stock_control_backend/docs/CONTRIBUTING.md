# Guia de Contribuição - Stock Control Backend

## Visão Geral

Este documento estabelece os padrões e diretrizes para contribuir com o projeto Stock Control Backend. Seguir estas diretrizes garante consistência, qualidade e facilita a manutenção do código.

## Como Contribuir

### 1. Configuração do Ambiente de Desenvolvimento

#### Pré-requisitos
- Python 3.8+
- Git
- PostgreSQL (opcional, SQLite para desenvolvimento)
- Virtualenv

#### Setup Inicial

```bash
# Fork e clone o repositório
git clone https://github.com/seu-usuario/stock-control-backend.git
cd stock-control-backend

# Crie ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instale dependências
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Dependências de desenvolvimento

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Execute migrações
python manage.py migrate

# Crie superusuário
python manage.py createsuperuser

# Execute testes
python manage.py test
```

### 2. Fluxo de Trabalho

#### Branching Strategy

Utilizamos **Git Flow** com as seguintes branches:

- `main`: Código em produção
- `develop`: Código em desenvolvimento
- `feature/*`: Novas funcionalidades
- `bugfix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes para produção

#### Criando uma Feature

```bash
# 1. Atualize develop
git checkout develop
git pull origin develop

# 2. Crie branch da feature
git checkout -b feature/nova-funcionalidade

# 3. Desenvolva sua feature
# ... código ...

# 4. Commit suas mudanças
git add .
git commit -m "feat: adiciona nova funcionalidade X"

# 5. Push para o repositório
git push origin feature/nova-funcionalidade

# 6. Abra Pull Request para develop
```

#### Criando um Bugfix

```bash
# 1. Crie branch do bugfix
git checkout -b bugfix/corrige-problema-y

# 2. Corrija o problema
# ... código ...

# 3. Commit
git commit -m "fix: corrige problema Y"

# 4. Push e abra PR
```

### 3. Padrões de Código

#### Python Style Guide

Seguimos **PEP 8** com algumas customizações:

```python
# ✅ Bom
class StockService:
    """Serviço para operações de estoque."""
    
    @staticmethod
    def calculate_stock_quantity(item: Item, stock_date: Optional[date] = None) -> Decimal:
        """
        Calcula quantidade em estoque.
        
        Args:
            item: Item para calcular
            stock_date: Data específica (opcional)
            
        Returns:
            Quantidade em estoque
            
        Raises:
            ValueError: Se item for inválido
        """
        if not item:
            raise ValueError("Item não pode ser None")
        
        # Implementação...
        return result

# ❌ Ruim
class stockservice:
    def calculate_stock_quantity(self,item,stock_date=None):
        if not item:raise ValueError("Item não pode ser None")
        return result
```

#### Nomenclatura

- **Classes**: PascalCase (`StockService`, `TransactionViewSet`)
- **Funções/Métodos**: snake_case (`calculate_stock_quantity`)
- **Variáveis**: snake_case (`stock_quantity`, `user_data`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Arquivos**: snake_case (`stock_service.py`, `transaction_views.py`)

#### Imports

```python
# Ordem dos imports (PEP 8)
# 1. Standard library
import os
from datetime import date
from typing import Optional, List

# 2. Third-party
from django.db import models
from rest_framework import serializers

# 3. Local imports
from .models import Item, Transacao
from .services import StockService
```

#### Docstrings

Use docstrings em formato Google:

```python
def calculate_average_cost(item: Item, start_date: date = None) -> Decimal:
    """
    Calcula o custo médio de um item.
    
    Args:
        item: Item para calcular o custo médio
        start_date: Data de início para cálculo (opcional)
        
    Returns:
        Custo médio do item
        
    Raises:
        ValueError: Se item for inválido
        CalculationError: Se não houver dados suficientes
        
    Example:
        >>> item = Item.objects.get(cod_sku='ITEM001')
        >>> cost = calculate_average_cost(item)
        >>> print(f"Custo médio: R$ {cost}")
    """
    pass
```

### 4. Estrutura de Arquivos

#### Organização de Código

```
inventory/
├── models.py              # Modelos de dados
├── services.py            # Lógica de negócio
├── views.py               # Views e ViewSets
├── serializers.py         # Serializers
├── filters.py             # Filtros
├── api.py                 # APIs específicas
├── utils.py               # Utilitários
├── backends.py            # Autenticação
├── middleware.py          # Middleware
├── urls.py                # URLs
├── admin.py               # Admin interface
├── apps.py                # Configuração da app
├── tests/                 # Testes
│   ├── test_models.py
│   ├── test_services.py
│   ├── test_views.py
│   └── test_api.py
└── management/            # Comandos customizados
    └── commands/
```

#### Convenções de Arquivos

- **Models**: Um arquivo por domínio (`models.py`)
- **Services**: Agrupe por funcionalidade (`stock_service.py`, `transaction_service.py`)
- **Views**: Separe por ViewSet (`item_views.py`, `transaction_views.py`)
- **Tests**: Espelhe a estrutura do código (`test_models.py`, `test_services.py`)

### 5. Testes

#### Estrutura de Testes

```python
# tests/test_services.py
from django.test import TestCase
from decimal import Decimal
from unittest.mock import patch, Mock

from inventory.models import Item, Transacao
from inventory.services import StockService


class StockServiceTestCase(TestCase):
    """Testes para StockService."""
    
    def setUp(self):
        """Configuração inicial para cada teste."""
        self.item = Item.objects.create(
            cod_sku='ITEM001',
            nome='Produto Teste',
            unidade='UN'
        )
    
    def test_calculate_stock_quantity_with_entries(self):
        """Testa cálculo de estoque com entradas."""
        # Arrange
        Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('100.00'),
            valor_unit=Decimal('25.50')
        )
        
        # Act
        stock = StockService.calculate_stock_quantity(self.item)
        
        # Assert
        self.assertEqual(stock, Decimal('100.00'))
    
    def test_calculate_stock_quantity_with_entries_and_outputs(self):
        """Testa cálculo de estoque com entradas e saídas."""
        # Arrange
        Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('100.00'),
            valor_unit=Decimal('25.50')
        )
        Transacao.objects.create(
            cod_sku=self.item,
            quantidade=Decimal('-30.00'),
            valor_unit=Decimal('25.50')
        )
        
        # Act
        stock = StockService.calculate_stock_quantity(self.item)
        
        # Assert
        self.assertEqual(stock, Decimal('70.00'))
    
    @patch('inventory.services.Transacao.objects')
    def test_calculate_stock_quantity_with_mock(self, mock_transacao):
        """Testa cálculo de estoque com mock."""
        # Arrange
        mock_transacao.filter.return_value.aggregate.return_value = {'total': Decimal('50.00')}
        
        # Act
        stock = StockService.calculate_stock_quantity(self.item)
        
        # Assert
        self.assertEqual(stock, Decimal('50.00'))
        mock_transacao.filter.assert_called_once()
```

#### Cobertura de Testes

Execute testes com cobertura:

```bash
# Instalar pytest-cov
pip install pytest-cov

# Executar com cobertura
pytest --cov=inventory --cov-report=html

# Ver relatório
open htmlcov/index.html
```

**Meta de cobertura**: Mínimo 80%

#### Tipos de Testes

1. **Unit Tests**: Testam funções/métodos isoladamente
2. **Integration Tests**: Testam integração entre componentes
3. **API Tests**: Testam endpoints da API
4. **Model Tests**: Testam modelos e validações

### 6. Commits

#### Conventional Commits

Use o padrão Conventional Commits:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, sem mudança de código
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Mudanças em build, dependências, etc.

**Exemplos:**

```bash
# Nova funcionalidade
git commit -m "feat(stock): adiciona cálculo de custo médio ponderado"

# Correção de bug
git commit -m "fix(api): corrige validação de quantidade negativa"

# Documentação
git commit -m "docs: atualiza guia de instalação"

# Refatoração
git commit -m "refactor(services): extrai lógica de validação para método separado"

# Testes
git commit -m "test(stock): adiciona testes para cálculo de estoque"
```

#### Mensagens de Commit

- Use imperativo ("adiciona" não "adicionado")
- Primeira linha até 50 caracteres
- Linha em branco antes do corpo
- Corpo até 72 caracteres por linha
- Explique o "porquê" no corpo, não o "o que"

### 7. Pull Requests

#### Template de PR

```markdown
## Descrição
Breve descrição das mudanças implementadas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (correção ou funcionalidade que quebra compatibilidade)
- [ ] Documentação (mudanças apenas na documentação)

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Realizei auto-review do meu código
- [ ] Comentei código complexo
- [ ] Minhas mudanças não geram warnings
- [ ] Adicionei testes que provam que minha correção é eficaz
- [ ] Testes novos e existentes passam localmente
- [ ] Atualizei a documentação conforme necessário

## Testes
Descreva os testes que você executou para verificar suas mudanças.

## Screenshots (se aplicável)
Adicione screenshots para ajudar a explicar sua mudança.

## Informações Adicionais
Qualquer informação adicional relevante.
```

#### Processo de Review

1. **Auto-review**: Revise seu próprio código antes de submeter
2. **Testes**: Certifique-se que todos os testes passam
3. **Documentação**: Atualize documentação se necessário
4. **Review**: Aguarde review de pelo menos 1 pessoa
5. **Merge**: Após aprovação, merge para develop

### 8. Documentação

#### Atualizando Documentação

- **README.md**: Mudanças na instalação ou uso básico
- **API.md**: Novos endpoints ou mudanças na API
- **ARCHITECTURE.md**: Mudanças na arquitetura
- **DEPLOYMENT.md**: Mudanças no processo de deploy
- **CONTRIBUTING.md**: Mudanças no processo de contribuição

#### Padrões de Documentação

- Use Markdown
- Inclua exemplos de código
- Mantenha atualizado
- Use linguagem clara e objetiva

### 9. Performance

#### Boas Práticas

```python
# ✅ Bom - Use select_related para foreign keys
items = Item.objects.select_related('categoria').all()

# ✅ Bom - Use prefetch_related para many-to-many
transacoes = Transacao.objects.prefetch_related('entradas', 'saidas').all()

# ✅ Bom - Use only() para campos específicos
items = Item.objects.only('cod_sku', 'nome').all()

# ❌ Ruim - N+1 queries
for item in Item.objects.all():
    print(item.categoria.nome)  # Query para cada item
```

#### Profiling

```python
# Use Django Debug Toolbar em desenvolvimento
# settings.py
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

### 10. Segurança

#### Validação de Dados

```python
# ✅ Bom - Validação no serializer
class TransacaoSerializer(serializers.ModelSerializer):
    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantidade deve ser positiva")
        return value

# ✅ Bom - Sanitização de entrada
from django.utils.html import escape
user_input = escape(request.POST.get('search', ''))
```

#### Autenticação e Autorização

```python
# ✅ Bom - Verificação de permissões
class TransacaoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Transacao.objects.filter(usuario=self.request.user)
```

### 11. Ferramentas de Desenvolvimento

#### Linting

```bash
# Instalar ferramentas
pip install flake8 black isort

# Executar linting
flake8 inventory/
black inventory/
isort inventory/
```

#### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/isort
    rev: 5.10.1
    hooks:
      - id: isort
  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8
```

### 12. Resolução de Conflitos

#### Git Merge Conflicts

```bash
# 1. Atualize sua branch
git checkout develop
git pull origin develop
git checkout feature/sua-feature
git rebase develop

# 2. Resolva conflitos
# Edite arquivos com conflitos
git add arquivo_resolvido.py
git rebase --continue

# 3. Force push se necessário
git push --force-with-lease origin feature/sua-feature
```

### 13. Comunicação

#### Issues

- Use templates de issue
- Seja específico e claro
- Inclua steps para reproduzir
- Adicione labels apropriadas

#### Discussões

- Use GitHub Discussions para ideias
- Seja respeitoso e construtivo
- Procure soluções, não problemas

### 14. Release Process

#### Versionamento

Seguimos **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **MAJOR**: Mudanças que quebram compatibilidade
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

#### Changelog

Mantenha `CHANGELOG.md` atualizado:

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- Cálculo de custo médio ponderado
- Endpoint para relatórios de estoque

### Changed
- Melhorada performance de consultas de estoque

### Fixed
- Correção na validação de quantidade negativa

## [1.1.0] - 2024-01-01

### Added
- Sistema de autenticação JWT
- Filtros avançados para transações
```

## Conclusão

Seguir estas diretrizes garante que o projeto mantenha alta qualidade, seja fácil de manter e evolua de forma consistente. Em caso de dúvidas, não hesite em abrir uma issue ou iniciar uma discussão.

**Lembre-se**: O objetivo é construir um sistema robusto e confiável que atenda às necessidades dos usuários de forma eficiente.

