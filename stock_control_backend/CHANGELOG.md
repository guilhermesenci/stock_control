# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Documentação completa da API
- Guia de arquitetura e padrões de design
- Guia de deploy para diferentes ambientes
- Guia de contribuição
- Exemplos práticos de uso
- Configuração de exemplo para variáveis de ambiente

### Changed
- Melhorada estrutura do README.md
- Adicionados badges de status
- Reorganizada documentação

## [1.2.0] - 2024-01-15

### Added
- Sistema de cálculo de custo médio ponderado
- Endpoint para relatórios de estoque unificados
- Filtros avançados para transações
- Validação de estoque disponível
- Sistema de alertas de estoque baixo
- Comandos de gerenciamento customizados

### Changed
- Melhorada performance de consultas de estoque
- Refatorada lógica de negócio para services
- Otimizados índices do banco de dados
- Melhorado sistema de logging

### Fixed
- Correção na validação de quantidade negativa
- Correção no cálculo de estoque com datas
- Correção na serialização de campos decimais

## [1.1.0] - 2024-01-01

### Added
- Sistema de autenticação JWT
- Endpoints para gestão de usuários
- Sistema de permissões baseado em usuário
- Filtros por data, item e fornecedor
- Paginação em todos os endpoints
- Sistema de logs estruturado

### Changed
- Migração de autenticação básica para JWT
- Melhorada estrutura de serializers
- Otimizadas consultas do banco

### Fixed
- Correção na validação de CNPJ
- Correção na formatação de datas
- Correção na serialização de relacionamentos

## [1.0.0] - 2023-12-15

### Added
- Sistema básico de controle de estoque
- Modelos para Item, Transação, Fornecedor
- API REST com Django REST Framework
- Endpoints CRUD para todas as entidades
- Sistema de entradas e saídas
- Cálculo básico de estoque
- Interface administrativa do Django
- Testes unitários básicos

### Technical Details
- Django 5.2
- Django REST Framework 3.16.0
- SQLite para desenvolvimento
- PostgreSQL para produção
- Python 3.8+

## [0.9.0] - 2023-12-01

### Added
- Estrutura inicial do projeto
- Configuração básica do Django
- Modelos iniciais
- Migrações do banco de dados

### Changed
- Configuração inicial do ambiente de desenvolvimento

## [0.8.0] - 2023-11-15

### Added
- Planejamento da arquitetura
- Definição dos requisitos
- Estrutura de diretórios
- Configuração inicial do Git

---

## Legend

- **Added** para novas funcionalidades
- **Changed** para mudanças em funcionalidades existentes
- **Deprecated** para funcionalidades que serão removidas
- **Removed** para funcionalidades removidas
- **Fixed** para correções de bugs
- **Security** para vulnerabilidades corrigidas

## Versioning

Este projeto usa [Semantic Versioning](https://semver.org/lang/pt-BR/):

- **MAJOR** (1.0.0): Mudanças que quebram compatibilidade
- **MINOR** (0.1.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.1): Correções de bugs

## Release Process

1. **Development**: Desenvolvimento em branch `develop`
2. **Testing**: Testes em ambiente de staging
3. **Release**: Merge para `main` com tag de versão
4. **Deploy**: Deploy automático para produção
5. **Documentation**: Atualização da documentação

## Breaking Changes

### v1.2.0
- Mudança na estrutura de resposta da API de estoque
- Novos campos obrigatórios em alguns endpoints

### v1.1.0
- Migração de autenticação básica para JWT
- Mudança na estrutura de permissões

### v1.0.0
- Primeira versão estável
- API pública definida

## Migration Guide

### From v1.1.0 to v1.2.0

1. **Update API calls**: Novos campos na resposta de estoque
2. **Update authentication**: Novos headers JWT
3. **Update database**: Execute migrações

### From v1.0.0 to v1.1.0

1. **Update authentication**: Migre para JWT
2. **Update permissions**: Configure novas permissões
3. **Update database**: Execute migrações

## Support

- **v1.2.x**: Suporte ativo
- **v1.1.x**: Suporte de segurança apenas
- **v1.0.x**: Sem suporte
- **v0.x.x**: Sem suporte

## Roadmap

### v1.3.0 (Planned)
- [ ] Sistema de notificações
- [ ] Relatórios avançados
- [ ] Integração com ERPs
- [ ] API GraphQL
- [ ] Cache Redis
- [ ] Background tasks

### v1.4.0 (Planned)
- [ ] Multi-tenancy
- [ ] Audit logs
- [ ] Backup automático
- [ ] Monitoring avançado
- [ ] Performance optimization

### v2.0.0 (Future)
- [ ] Microservices architecture
- [ ] Event sourcing
- [ ] CQRS pattern
- [ ] Message queues
- [ ] Container orchestration

## Contributing

Para contribuir com o projeto:

1. Leia o [Guia de Contribuição](docs/CONTRIBUTING.md)
2. Siga os padrões de commit
3. Adicione testes para novas funcionalidades
4. Atualize a documentação
5. Abra um Pull Request

## License

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

