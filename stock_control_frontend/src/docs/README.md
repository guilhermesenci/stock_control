# Documentação Técnica - Stock Control Frontend

Bem-vindo à documentação técnica completa do frontend do sistema Stock Control. Esta documentação cobre todos os aspectos do desenvolvimento, arquitetura e deploy da aplicação.

## 📚 Índice da Documentação

### 🏗️ Arquitetura e Estrutura
- [**Arquitetura do Sistema**](./ARCHITECTURE.md) - Visão geral da arquitetura, padrões e decisões de design
- [**Guia de Componentes**](./COMPONENTS_GUIDE.md) - Documentação completa dos componentes Vue

### 🔌 Integração e APIs
- [**Documentação da API**](./API_DOCUMENTATION.md) - Serviços, endpoints e padrões de comunicação
- [**Guia de UX e Refatoração**](./UX_REFACTORING_GUIDE.md) - Sistema de notificações e feedback visual

### 🧪 Testes e Qualidade
- [**Guia de Testes**](../TESTING.md) - Como executar e escrever testes
- [**Tratamento de Erros**](./ERROR_HANDLING_IMPROVEMENTS.md) - Sistema de tratamento de erros

### ♿ Acessibilidade e UX
- [**Guia de Acessibilidade**](./ACCESSIBILITY_GUIDE.md) - Recursos de acessibilidade implementados
- [**Guia de Paginação**](./PAGINATION_GUIDE.md) - Sistema de paginação

### 🚀 Deploy e Produção
- [**Guia de Deploy**](./DEPLOYMENT_GUIDE.md) - Deploy em diferentes ambientes e plataformas

## 🎯 Como Usar Esta Documentação

### Para Desenvolvedores
1. **Comece com a [Arquitetura](./ARCHITECTURE.md)** para entender a estrutura geral
2. **Consulte o [Guia de Componentes](./COMPONENTS_GUIDE.md)** para trabalhar com a UI
3. **Use a [Documentação da API](./API_DOCUMENTATION.md)** para integração com o backend
4. **Siga o [Guia de Testes](../TESTING.md)** para escrever testes

### Para DevOps/Deploy
1. **Consulte o [Guia de Deploy](./DEPLOYMENT_GUIDE.md)** para configuração de produção
2. **Verifique as configurações de ambiente** na documentação de deploy

### Para QA/Testes
1. **Use o [Guia de Testes](../TESTING.md)** para executar testes
2. **Consulte o [Guia de Acessibilidade](./ACCESSIBILITY_GUIDE.md)** para testes de acessibilidade

## 🏃‍♂️ Início Rápido

### Configuração do Ambiente
```bash
# Clone e instale dependências
git clone <repository-url>
cd stock_control_frontend
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Inicie o desenvolvimento
npm run dev
```

### Comandos Essenciais
```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run preview          # Preview do build

# Testes
npm run test:unit        # Testes unitários
npm run test:e2e         # Testes E2E
npm run test:coverage    # Cobertura de testes

# Qualidade
npm run lint             # Linting
npm run format           # Formatação
npm run type-check       # Verificação de tipos
```

## 🎨 Stack Tecnológica

### Frontend
- **Vue 3** - Framework JavaScript reativo
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento

### Testes
- **Vitest** - Testes unitários
- **Vue Test Utils** - Testes de componentes
- **Playwright** - Testes E2E

### Qualidade
- **ESLint** - Linting
- **Prettier** - Formatação
- **TypeScript** - Verificação de tipos

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes Vue reutilizáveis
│   ├── base/           # Componentes base
│   ├── forms/          # Componentes de formulário
│   ├── layout/         # Componentes de layout
│   └── tables/         # Componentes de tabela
├── composables/         # Lógica reativa compartilhada
├── services/           # Serviços de API
├── stores/             # Stores Pinia
├── types/              # Definições TypeScript
├── utils/              # Utilitários
├── views/              # Páginas da aplicação
├── router/             # Configuração de rotas
└── docs/               # Documentação técnica
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Desenvolvimento (`.env.local`)
```bash
VITE_API_BASE_URL=http://localhost:8000/api/
VITE_APP_TITLE=Stock Control (Dev)
VITE_APP_ENVIRONMENT=development
```

#### Produção (`.env.production`)
```bash
VITE_API_BASE_URL=https://api.stockcontrol.com/api/
VITE_APP_TITLE=Stock Control
VITE_APP_ENVIRONMENT=production
```

### IDE Recomendada
- **VSCode** com extensões:
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Suporte Vue 3
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 🧪 Testes

### Estrutura de Testes
```
src/
├── components/__tests__/    # Testes de componentes
├── composables/__tests__/   # Testes de composables
├── services/__tests__/      # Testes de serviços
├── stores/__tests__/        # Testes de stores
└── test/                    # Utilitários de teste
```

### Executando Testes
```bash
# Todos os testes
npm run test:unit

# Testes específicos
npm run test:components    # Componentes
npm run test:services      # Serviços
npm run test:composables   # Composables
npm run test:stores        # Stores

# Com cobertura
npm run test:coverage

# E2E
npm run test:e2e
```

## 🚀 Deploy

### Ambientes Suportados
- **Desenvolvimento**: Local com Vite dev server
- **Produção**: Servidor web estático (Nginx, Apache)
- **Cloud**: Vercel, Netlify, AWS S3 + CloudFront
- **Container**: Docker com Nginx

### Comandos de Deploy
```bash
# Build de produção
npm run build

# Preview local
npm run preview

# Deploy (depende da plataforma)
# Ver guia específico em DEPLOYMENT_GUIDE.md
```

## 🔒 Segurança

### Práticas Implementadas
- **HTTPS**: Comunicação segura
- **CSP**: Content Security Policy
- **Headers de Segurança**: X-Frame-Options, X-XSS-Protection
- **Validação**: Client-side e server-side
- **Autenticação**: JWT com refresh tokens

## ♿ Acessibilidade

### Recursos Implementados
- **WCAG 2.1 AA**: Conformidade com diretrizes
- **Alto Contraste**: Modo de alto contraste
- **Tamanhos de Fonte**: Escalabilidade de texto
- **Redução de Movimento**: Controle de animações
- **Navegação por Teclado**: Suporte completo
- **Screen Readers**: Atributos ARIA

## 📊 Performance

### Otimizações
- **Code Splitting**: Divisão de código
- **Lazy Loading**: Carregamento sob demanda
- **Tree Shaking**: Remoção de código não usado
- **Compression**: Gzip/Brotli
- **Caching**: Cache de assets estáticos

### Métricas
- **Lighthouse Score**: >90 em todas as categorias
- **Bundle Size**: <500KB gzipped
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s

## 🤝 Contribuição

### Padrões de Código
- **TypeScript**: Tipagem estática obrigatória
- **ESLint**: Seguir regras configuradas
- **Prettier**: Formatação automática
- **Conventional Commits**: Padrão de commits
- **Testes**: Cobertura mínima de 80%

### Processo de Contribuição
1. Fork do repositório
2. Criar branch para feature (`feature/nova-feature`)
3. Implementar com testes
4. Executar linting e testes
5. Abrir Pull Request

## 📞 Suporte

### Recursos de Ajuda
1. **Documentação**: Consulte os guias específicos
2. **Testes**: Verifique exemplos nos testes
3. **Issues**: Abra issue no repositório
4. **Discussions**: Use GitHub Discussions

### Contato
- **Equipe de Desenvolvimento**: dev@stockcontrol.com
- **Issues**: [GitHub Issues](https://github.com/stockcontrol/frontend/issues)
- **Documentação**: [GitHub Wiki](https://github.com/stockcontrol/frontend/wiki)

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Mantenedor**: Equipe de Desenvolvimento Stock Control
