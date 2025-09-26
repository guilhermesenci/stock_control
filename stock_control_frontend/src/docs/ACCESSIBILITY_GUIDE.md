# Guia de Acessibilidade - Stock Control

Este documento descreve os recursos de acessibilidade implementados no sistema Stock Control e como utilizá-los.

## Recursos Implementados

### 1. Aumento de Fonte
- **Pequeno**: 87.5% do tamanho normal
- **Normal**: Tamanho padrão (100%)
- **Grande**: 112.5% do tamanho normal
- **Extra Grande**: 125% do tamanho normal

### 2. Alto Contraste
- Aumenta o contraste entre texto e fundo
- Melhora a legibilidade para usuários com dificuldades visuais
- Aplica cores de alto contraste em todos os elementos da interface

### 3. Redução de Movimento
- Reduz animações e transições
- Útil para usuários sensíveis a movimento
- Desativa efeitos visuais que podem causar desconforto

## Como Usar

### Acessando as Configurações
1. Clique no menu lateral (ícone ☰)
2. Clique no botão "♿ Acessibilidade" na parte inferior do menu
3. Configure as opções desejadas no modal que abrir

### Configurações Disponíveis

#### Tamanho da Fonte
- Selecione entre as 4 opções de tamanho
- A mudança é aplicada imediatamente
- Afeta todo o texto da aplicação

#### Alto Contraste
- Ative/desative com o botão toggle
- Aplica cores de alto contraste em:
  - Texto e fundo
  - Botões e formulários
  - Tabelas e modais
  - Bordas e elementos interativos

#### Redução de Movimento
- Ative/desative com o botão toggle
- Reduz significativamente:
  - Duração das animações
  - Número de iterações
  - Transições entre estados

### Restaurar Padrões
- Use o botão "🔄 Restaurar Padrões" para voltar às configurações originais
- Remove todas as personalizações de acessibilidade

## Persistência

Todas as configurações são salvas automaticamente no navegador e serão mantidas entre sessões. As configurações são aplicadas automaticamente quando você acessa a aplicação.

## Implementação Técnica

### Arquivos Principais
- `stores/accessibility.ts` - Store Pinia para gerenciar estado
- `composables/useAccessibility.ts` - Composable para facilitar uso
- `components/AccessibilitySettings.vue` - Interface de configuração
- `assets/base.css` - Estilos CSS para acessibilidade

### Variáveis CSS
O sistema utiliza variáveis CSS customizadas que são aplicadas dinamicamente:
- `--accessibility-font-size`
- `--accessibility-font-size-small`
- `--accessibility-font-size-large`
- `--accessibility-font-size-extra-large`

### Classes CSS
- `.font-size-small`, `.font-size-large`, `.font-size-extra-large`
- `.high-contrast`
- `.reduced-motion`

## Compatibilidade

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móveis

## Padrões de Acessibilidade Seguidos

- **WCAG 2.1 AA**: Conformidade com diretrizes de acessibilidade web
- **Seção 508**: Padrões de acessibilidade para tecnologia da informação
- **ARIA**: Atributos para melhorar acessibilidade de leitores de tela

## Suporte

Para problemas ou sugestões relacionadas à acessibilidade, entre em contato com a equipe de desenvolvimento.

## Atualizações Futuras

Recursos planejados para futuras versões:
- Suporte a leitores de tela
- Navegação por teclado aprimorada
- Temas de alto contraste personalizáveis
- Configurações de espaçamento entre elementos
- Suporte a zoom da página
