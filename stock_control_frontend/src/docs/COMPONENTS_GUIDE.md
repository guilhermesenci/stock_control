# Guia de Componentes - Stock Control Frontend

Este documento descreve os componentes Vue reutilizáveis do sistema Stock Control, suas props, eventos e exemplos de uso.

## 🎯 Visão Geral

O sistema de componentes do Stock Control segue uma arquitetura hierárquica com componentes base, específicos e de layout, todos construídos com Vue 3 Composition API e TypeScript.

### Hierarquia de Componentes

```
components/
├── base/              # Componentes fundamentais
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseModal.vue
│   └── BaseTable.vue
├── forms/             # Componentes de formulário
│   ├── FormField.vue
│   ├── FormSelect.vue
│   └── FormDatePicker.vue
├── layout/            # Componentes de layout
│   ├── AppHeader.vue
│   ├── AppSidebar.vue
│   └── AppLayout.vue
├── tables/            # Componentes de tabela
│   ├── DataTable.vue
│   ├── TablePagination.vue
│   └── TableFilters.vue
└── feedback/          # Componentes de feedback
    ├── LoadingSpinner.vue
    ├── LoadingButton.vue
    └── NotificationContainer.vue
```

## 🧱 Componentes Base

### BaseButton

Componente de botão reutilizável com variantes e estados.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success'` | `'primary'` | Estilo do botão |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamanho do botão |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo do botão |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `click` | `MouseEvent` | Clique no botão |

#### Exemplo de Uso

```vue
<template>
  <BaseButton 
    variant="primary" 
    size="large" 
    :loading="isSubmitting"
    @click="handleSubmit"
  >
    Salvar
  </BaseButton>
</template>
```

### BaseInput

Componente de input com validação e feedback visual.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `modelValue` | `string \| number` | `''` | Valor do input |
| `type` | `string` | `'text'` | Tipo do input |
| `label` | `string` | `''` | Label do campo |
| `placeholder` | `string` | `''` | Placeholder |
| `error` | `string` | `''` | Mensagem de erro |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `required` | `boolean` | `false` | Campo obrigatório |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `update:modelValue` | `string \| number` | Atualização do valor |
| `blur` | `FocusEvent` | Perda de foco |
| `focus` | `FocusEvent` | Ganho de foco |

#### Exemplo de Uso

```vue
<template>
  <BaseInput
    v-model="email"
    type="email"
    label="Email"
    placeholder="Digite seu email"
    :error="emailError"
    required
  />
</template>
```

### BaseModal

Componente de modal reutilizável.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `show` | `boolean` | `false` | Visibilidade do modal |
| `title` | `string` | `''` | Título do modal |
| `size` | `'small' \| 'medium' \| 'large' \| 'full'` | `'medium'` | Tamanho do modal |
| `closable` | `boolean` | `true` | Permitir fechar |
| `persistent` | `boolean` | `false` | Não fechar ao clicar fora |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `update:show` | `boolean` | Atualização da visibilidade |
| `close` | `void` | Modal fechado |

#### Exemplo de Uso

```vue
<template>
  <BaseModal
    v-model:show="showModal"
    title="Confirmar Exclusão"
    size="small"
    @close="handleClose"
  >
    <p>Tem certeza que deseja excluir este item?</p>
    
    <template #footer>
      <BaseButton variant="secondary" @click="showModal = false">
        Cancelar
      </BaseButton>
      <BaseButton variant="danger" @click="handleDelete">
        Excluir
      </BaseButton>
    </template>
  </BaseModal>
</template>
```

### BaseTable

Componente de tabela com funcionalidades avançadas.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `data` | `any[]` | `[]` | Dados da tabela |
| `columns` | `TableColumn[]` | `[]` | Definição das colunas |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `selectable` | `boolean` | `false` | Permitir seleção |
| `sortable` | `boolean` | `true` | Permitir ordenação |
| `pagination` | `PaginationConfig` | `undefined` | Configuração de paginação |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `sort` | `{ column: string, direction: 'asc' \| 'desc' }` | Ordenação alterada |
| `select` | `any[]` | Seleção alterada |
| `row-click` | `{ row: any, index: number }` | Clique em linha |

#### Exemplo de Uso

```vue
<template>
  <BaseTable
    :data="items"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    selectable
    @sort="handleSort"
    @select="handleSelect"
  />
</template>

<script setup>
const columns = [
  { key: 'cod_sku', label: 'SKU', sortable: true },
  { key: 'descricao_item', label: 'Descrição', sortable: true },
  { key: 'preco_venda', label: 'Preço', sortable: true, formatter: 'currency' },
  { key: 'estoque_atual', label: 'Estoque', sortable: true }
];
</script>
```

## 📝 Componentes de Formulário

### FormField

Componente de campo de formulário com validação integrada.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `modelValue` | `any` | `undefined` | Valor do campo |
| `label` | `string` | `''` | Label do campo |
| `type` | `string` | `'text'` | Tipo do campo |
| `rules` | `ValidationRule[]` | `[]` | Regras de validação |
| `error` | `string` | `''` | Erro externo |
| `required` | `boolean` | `false` | Campo obrigatório |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `update:modelValue` | `any` | Atualização do valor |
| `validate` | `{ isValid: boolean, error: string }` | Resultado da validação |

#### Exemplo de Uso

```vue
<template>
  <FormField
    v-model="formData.email"
    label="Email"
    type="email"
    :rules="emailRules"
    required
    @validate="handleValidation"
  />
</template>

<script setup>
import { validationRules } from '@/composables/useFormValidation';

const emailRules = [
  validationRules.required('Email é obrigatório'),
  validationRules.email('Email inválido')
];
</script>
```

### FormSelect

Componente de seleção com busca e múltipla seleção.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `modelValue` | `any \| any[]` | `undefined` | Valor selecionado |
| `options` | `SelectOption[]` | `[]` | Opções disponíveis |
| `label` | `string` | `''` | Label do campo |
| `placeholder` | `string` | `'Selecione...'` | Placeholder |
| `multiple` | `boolean` | `false` | Seleção múltipla |
| `searchable` | `boolean` | `false` | Permitir busca |
| `loading` | `boolean` | `false` | Estado de carregamento |

#### Exemplo de Uso

```vue
<template>
  <FormSelect
    v-model="selectedSupplier"
    :options="supplierOptions"
    label="Fornecedor"
    placeholder="Selecione um fornecedor"
    searchable
    @search="handleSupplierSearch"
  />
</template>
```

## 🎨 Componentes de Layout

### AppLayout

Layout principal da aplicação.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `title` | `string` | `'Stock Control'` | Título da aplicação |
| `showSidebar` | `boolean` | `true` | Mostrar sidebar |
| `sidebarCollapsed` | `boolean` | `false` | Sidebar colapsada |

#### Slots

| Slot | Descrição |
|------|-----------|
| `default` | Conteúdo principal |
| `sidebar` | Conteúdo da sidebar |
| `header` | Conteúdo do header |

#### Exemplo de Uso

```vue
<template>
  <AppLayout
    title="Stock Control"
    :sidebar-collapsed="sidebarCollapsed"
  >
    <template #sidebar>
      <AppSidebar />
    </template>
    
    <template #header>
      <AppHeader />
    </template>
    
    <router-view />
  </AppLayout>
</template>
```

### AppSidebar

Sidebar de navegação da aplicação.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `collapsed` | `boolean` | `false` | Estado colapsado |
| `items` | `MenuItem[]` | `[]` | Itens do menu |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `navigate` | `{ path: string, item: MenuItem }` | Navegação |

#### Exemplo de Uso

```vue
<template>
  <AppSidebar
    :collapsed="collapsed"
    :items="menuItems"
    @navigate="handleNavigation"
  />
</template>
```

## 📊 Componentes de Tabela

### DataTable

Tabela de dados avançada com filtros e paginação.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `data` | `any[]` | `[]` | Dados da tabela |
| `columns` | `TableColumn[]` | `[]` | Definição das colunas |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `pagination` | `PaginationConfig` | `undefined` | Configuração de paginação |
| `filters` | `TableFilter[]` | `[]` | Filtros disponíveis |
| `actions` | `TableAction[]` | `[]` | Ações da tabela |

#### Exemplo de Uso

```vue
<template>
  <DataTable
    :data="items"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    :actions="actions"
    @filter="handleFilter"
    @action="handleAction"
  />
</template>
```

### TablePagination

Componente de paginação para tabelas.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `currentPage` | `number` | `1` | Página atual |
| `totalPages` | `number` | `1` | Total de páginas |
| `totalItems` | `number` | `0` | Total de itens |
| `itemsPerPage` | `number` | `10` | Itens por página |
| `showInfo` | `boolean` | `true` | Mostrar informações |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `page-change` | `number` | Mudança de página |
| `items-per-page-change` | `number` | Mudança de itens por página |

## 🔄 Componentes de Feedback

### LoadingSpinner

Indicador de carregamento.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamanho do spinner |
| `message` | `string` | `''` | Mensagem de carregamento |
| `overlay` | `boolean` | `false` | Mostrar como overlay |

#### Exemplo de Uso

```vue
<template>
  <LoadingSpinner
    size="large"
    message="Carregando dados..."
    :overlay="true"
  />
</template>
```

### LoadingButton

Botão com estado de carregamento.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `loading` | `boolean` | `false` | Estado de carregamento |
| `loadingText` | `string` | `'Carregando...'` | Texto durante carregamento |
| `variant` | `string` | `'primary'` | Variante do botão |
| `size` | `string` | `'medium'` | Tamanho do botão |

#### Exemplo de Uso

```vue
<template>
  <LoadingButton
    :loading="isSubmitting"
    loading-text="Salvando..."
    variant="primary"
    @click="handleSubmit"
  >
    Salvar
  </LoadingButton>
</template>
```

### NotificationContainer

Container de notificações do sistema.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | Posição das notificações |
| `maxNotifications` | `number` | `5` | Máximo de notificações |

#### Exemplo de Uso

```vue
<template>
  <NotificationContainer
    position="top-right"
    :max-notifications="5"
  />
</template>
```

## 🎯 Componentes Específicos

### ItemForm

Formulário específico para criação/edição de itens.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `item` | `Item \| null` | `null` | Item para edição |
| `suppliers` | `Supplier[]` | `[]` | Lista de fornecedores |
| `loading` | `boolean` | `false` | Estado de carregamento |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `submit` | `ItemFormData` | Submissão do formulário |
| `cancel` | `void` | Cancelamento |

#### Exemplo de Uso

```vue
<template>
  <ItemForm
    :item="selectedItem"
    :suppliers="suppliers"
    :loading="isSubmitting"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>
```

### SupplierCard

Card de exibição de fornecedor.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `supplier` | `Supplier` | `undefined` | Dados do fornecedor |
| `showActions` | `boolean` | `true` | Mostrar ações |
| `compact` | `boolean` | `false` | Modo compacto |

#### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `edit` | `Supplier` | Editar fornecedor |
| `delete` | `Supplier` | Deletar fornecedor |
| `view` | `Supplier` | Visualizar fornecedor |

## 🧪 Testes de Componentes

### Estrutura de Testes

```typescript
// components/__tests__/BaseButton.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from '../BaseButton.vue';

describe('BaseButton', () => {
  it('renders with correct text', () => {
    const wrapper = mount(BaseButton, {
      slots: { default: 'Click me' }
    });
    
    expect(wrapper.text()).toBe('Click me');
  });

  it('emits click event', async () => {
    const wrapper = mount(BaseButton);
    
    await wrapper.trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('shows loading state', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true }
    });
    
    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });
});
```

### Utilitários de Teste

```typescript
// test/utils.ts
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

export function createWrapper(component: any, options = {}) {
  const pinia = createPinia();
  const router = createRouter({
    history: createWebHistory(),
    routes: []
  });

  return mount(component, {
    global: {
      plugins: [pinia, router]
    },
    ...options
  });
}
```

## 🎨 Estilização

### CSS Custom Properties

```css
/* assets/base.css */
:root {
  /* Cores primárias */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #60a5fa;
  
  /* Cores de estado */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Espaçamentos */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Tipografia */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
```

### Classes Utilitárias

```css
/* Componentes base */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
}

.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.input-error {
  @apply border-red-500 focus:ring-red-500;
}
```

## 📱 Responsividade

### Breakpoints

```css
/* Tailwind CSS breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Componentes Responsivos

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="item in items" :key="item.id" class="card">
      <!-- Conteúdo do card -->
    </div>
  </div>
</template>
```

## ♿ Acessibilidade

### ARIA Labels

```vue
<template>
  <button
    :aria-label="loading ? 'Carregando...' : 'Salvar'"
    :aria-disabled="loading"
    :disabled="loading"
  >
    <LoadingSpinner v-if="loading" aria-hidden="true" />
    <span v-else>Salvar</span>
  </button>
</template>
```

### Navegação por Teclado

```vue
<template>
  <div
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    role="button"
    :aria-pressed="isActive"
  >
    <!-- Conteúdo -->
  </div>
</template>
```

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Mantenedor**: Equipe de Desenvolvimento Stock Control
