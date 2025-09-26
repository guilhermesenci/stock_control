# Stock Control Frontend

Sistema de controle de estoque desenvolvido com Vue 3, TypeScript e Vite. Este frontend oferece uma interface moderna e acessível para gerenciar inventário, fornecedores, transações e relatórios.

## 🚀 Características Principais

- **Interface Moderna**: Design responsivo e intuitivo
- **Acessibilidade**: Recursos de acessibilidade integrados (alto contraste, tamanhos de fonte, redução de movimento)
- **Sistema de Notificações**: Feedback visual completo para todas as operações
- **Validação Robusta**: Sistema de validação de formulários com feedback imediato
- **Estados de Carregamento**: Indicadores visuais durante operações assíncronas
- **Testes Abrangentes**: Cobertura de testes unitários e E2E
- **TypeScript**: Tipagem estática para maior segurança e produtividade

## 🏗️ Arquitetura

### Stack Tecnológica
- **Vue 3** - Framework JavaScript reativo
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Axios** - Cliente HTTP
- **Vitest** - Testes unitários
- **Playwright** - Testes E2E

### Estrutura do Projeto
```
src/
├── components/          # Componentes Vue reutilizáveis
├── composables/         # Lógica reativa compartilhada
├── services/           # Serviços de API e integração
├── stores/             # Stores Pinia para estado global
├── types/              # Definições TypeScript
├── utils/              # Utilitários e helpers
├── views/              # Páginas da aplicação
├── router/             # Configuração de rotas
└── docs/               # Documentação técnica
```

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Backend Stock Control rodando

### IDE Recomendada
[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (desabilite o Vetur).

### Suporte a TypeScript
O projeto usa `vue-tsc` para verificação de tipos. No editor, o [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) é necessário para suporte completo ao TypeScript com arquivos `.vue`.

## 🚀 Início Rápido

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd stock_control_frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente (se necessário)
cp .env.example .env.local
```

### Desenvolvimento
```bash
# Inicie o servidor de desenvolvimento
npm run dev

# A aplicação estará disponível em http://localhost:5173
```

### Build para Produção
```bash
# Verificação de tipos e build
npm run build

# Preview do build de produção
npm run preview
```

## 🧪 Testes

### Testes Unitários
```bash
# Executar todos os testes
npm run test:unit

# Modo watch (desenvolvimento)
npm run test:unit:watch

# Com cobertura de código
npm run test:unit:coverage

# Interface visual dos testes
npm run test:unit:ui

# Testes específicos por categoria
npm run test:components    # Testes de componentes
npm run test:services      # Testes de serviços
npm run test:composables   # Testes de composables
npm run test:stores        # Testes de stores
npm run test:utils         # Testes de utilitários
```

### Testes E2E
```bash
# Instalar browsers (primeira execução)
npx playwright install

# Build necessário para testes E2E
npm run build

# Executar testes E2E
npm run test:e2e

# Opções específicas
npm run test:e2e -- --project=chromium  # Apenas Chromium
npm run test:e2e -- tests/example.spec.ts  # Arquivo específico
npm run test:e2e -- --debug  # Modo debug
```

## 🔧 Qualidade de Código

### Linting e Formatação
```bash
# Executar linting (ESLint + Oxlint)
npm run lint

# Formatar código com Prettier
npm run format

# Verificação de tipos TypeScript
npm run type-check
```

## 📚 Documentação

### Documentação Técnica Completa
- [**📖 Índice da Documentação**](./src/docs/README.md) - Guia completo de toda a documentação
- [**🏗️ Arquitetura do Sistema**](./src/docs/ARCHITECTURE.md) - Visão geral da arquitetura e padrões
- [**🧱 Guia de Componentes**](./src/docs/COMPONENTS_GUIDE.md) - Documentação completa dos componentes Vue
- [**🔌 Documentação da API**](./src/docs/API_DOCUMENTATION.md) - Serviços, endpoints e integração
- [**🚀 Guia de Deploy**](./src/docs/DEPLOYMENT_GUIDE.md) - Deploy em diferentes ambientes

### Guias Específicos
- [**🧪 Guia de Testes**](./TESTING.md) - Como executar e escrever testes
- [**♿ Guia de Acessibilidade**](./src/docs/ACCESSIBILITY_GUIDE.md) - Recursos de acessibilidade
- [**🎨 Sistema de UX**](./src/docs/UX_REFACTORING_GUIDE.md) - UX e feedback visual
- [**⚠️ Tratamento de Erros**](./src/docs/ERROR_HANDLING_IMPROVEMENTS.md) - Sistema de erros
- [**📄 Guia de Paginação**](./src/docs/PAGINATION_GUIDE.md) - Sistema de paginação

### Estrutura de Documentação
```
src/docs/
├── README.md                        # Índice da documentação
├── ARCHITECTURE.md                  # Arquitetura do sistema
├── COMPONENTS_GUIDE.md              # Guia de componentes
├── API_DOCUMENTATION.md             # Documentação da API
├── DEPLOYMENT_GUIDE.md              # Guia de deploy
├── ACCESSIBILITY_GUIDE.md           # Recursos de acessibilidade
├── ERROR_HANDLING_IMPROVEMENTS.md   # Sistema de tratamento de erros
├── PAGINATION_GUIDE.md              # Guia de paginação
├── PAGINATION_IMPLEMENTATION_SUMMARY.md
├── PAGINATION_SUMMARY.md
└── UX_REFACTORING_GUIDE.md          # Guia de UX e componentes
```

## 🔗 Integração com Backend

O frontend se conecta com o backend Django através de APIs REST. Certifique-se de que:

1. O backend está rodando (geralmente em `http://localhost:8000`)
2. As configurações de API estão corretas nos serviços
3. O CORS está configurado no backend para permitir requisições do frontend

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor web estático.

### Variáveis de Ambiente
Configure as seguintes variáveis para produção:
- `VITE_API_BASE_URL` - URL base da API do backend
- `VITE_APP_TITLE` - Título da aplicação

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript para tipagem
- Siga as convenções do ESLint configurado
- Escreva testes para novas funcionalidades
- Documente mudanças significativas

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação técnica em `src/docs/`
2. Verifique os testes existentes para exemplos
3. Abra uma issue no repositório
