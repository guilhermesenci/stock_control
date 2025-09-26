# Guia de Refatoração UX - Sistema de Notificações e Feedback

Este documento explica como usar o novo sistema de notificações, loading states e validação de formulários implementado no projeto.

## 🎯 Objetivos da Refatoração

- **Experiência do usuário consistente**: Sistema unificado de feedback visual
- **Tratamento centralizado de erros**: Notificações padronizadas
- **Estados de carregamento**: Feedback visual durante operações assíncronas
- **Validação de formulários**: Sistema robusto de validação com feedback imediato
- **Acessibilidade**: Componentes acessíveis e responsivos

## 📦 Componentes Principais

### 1. Sistema de Notificações

#### Store de Notificações (`stores/notifications.ts`)
```typescript
import { useNotificationStore } from '@/stores/notifications';

const notificationStore = useNotificationStore();

// Métodos disponíveis
notificationStore.success('Sucesso', 'Operação realizada com sucesso!');
notificationStore.error('Erro', 'Algo deu errado');
notificationStore.warning('Atenção', 'Verifique os dados');
notificationStore.info('Informação', 'Dados atualizados');

// Notificação com ações
notificationStore.error('Erro', 'Falha na operação', {
  actions: [
    {
      label: 'Tentar novamente',
      action: () => retryOperation(),
      style: 'primary'
    }
  ]
});
```

#### Composable de Tratamento de Erros (`composables/useApiError.ts`)
```typescript
import { useErrorHandler } from '@/composables/useApiError';

const { handleError, handleSuccess, handleWarning, handleInfo } = useErrorHandler();

// Tratamento automático de erros de API
try {
  await apiCall();
} catch (error) {
  handleError(error, 'Erro personalizado');
}

// Notificações de sucesso
handleSuccess('Sucesso', 'Dados salvos com sucesso!');
```

### 2. Estados de Carregamento

#### Composable de Loading (`composables/useLoading.ts`)
```typescript
import { useLoading } from '@/composables/useLoading';

const { loading, setLoading, withLoading } = useLoading();

// Método 1: Controle manual
setLoading(true);
try {
  await operation();
} finally {
  setLoading(false);
}

// Método 2: Automático com withLoading
await withLoading(async () => {
  await operation();
});
```

#### Componente LoadingButton
```vue
<template>
  <LoadingButton 
    :loading="submitting"
    variant="primary"
    size="large"
    @click="handleSubmit"
  >
    Salvar
  </LoadingButton>
</template>
```

#### Componente LoadingSpinner
```vue
<template>
  <LoadingSpinner 
    size="medium"
    message="Carregando dados..."
    :overlay="true"
  />
</template>
```

### 3. Validação de Formulários

#### Composable de Validação (`composables/useFormValidation.ts`)
```typescript
import { useFormValidation, validationRules } from '@/composables/useFormValidation';

const {
  fields,
  errors,
  isValid,
  setFieldValue,
  validateForm,
  getFormData
} = useFormValidation({
  email: '',
  password: '',
  name: ''
});

// Adicionar regras de validação
setFieldRules('email', [
  validationRules.required('Email é obrigatório'),
  validationRules.email('Email inválido')
]);

setFieldRules('password', [
  validationRules.required('Senha é obrigatória'),
  validationRules.minLength(8, 'Senha deve ter pelo menos 8 caracteres')
]);
```

#### Componente FormField
```vue
<template>
  <FormField
    v-model="formData.email"
    label="Email"
    type="email"
    placeholder="Digite seu email"
    :rules="[
      validationRules.required('Email é obrigatório'),
      validationRules.email('Email inválido')
    ]"
    @validate="(isValid, error) => handleFieldValidation('email', isValid, error)"
  />
</template>
```

### 4. Estados de Página

#### Composable de Estado de Página (`composables/usePageState.ts`)
```typescript
import { usePageState } from '@/composables/usePageState';

const { loading, error, data, empty, execute } = usePageState([]);

// Executar operação com controle de estado
const loadData = async () => {
  await execute(async () => {
    const response = await api.getData();
    return response.data;
  });
};
```

#### Componente PageContainer
```vue
<template>
  <PageContainer
    title="Lista de Itens"
    :global-loading="loading"
    :error="error"
    :empty="empty"
    empty-title="Nenhum item encontrado"
    empty-message="Não há dados para exibir no momento."
    @retry="loadData"
  >
    <template #actions>
      <LoadingButton @click="createItem" variant="primary">
        Novo Item
      </LoadingButton>
    </template>

    <div v-if="data.length">
      <!-- Conteúdo da lista -->
    </div>
  </PageContainer>
</template>
```

## 🔄 Migração de Código Existente

### Antes (Sistema Antigo)
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" />
    <p v-if="error" class="error">{{ error }}</p>
    <button :disabled="loading">
      {{ loading ? 'Salvando...' : 'Salvar' }}
    </button>
  </form>
</template>

<script setup>
const email = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  
  try {
    await api.save(email.value);
    alert('Salvo com sucesso!');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
```

### Depois (Sistema Novo)
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <FormField
      v-model="formData.email"
      label="Email"
      type="email"
      :rules="[validationRules.required(), validationRules.email()]"
    />
    
    <LoadingButton 
      type="submit"
      :loading="submitting"
      variant="primary"
    >
      Salvar
    </LoadingButton>
  </form>
</template>

<script setup>
import { useFormValidation, validationRules } from '@/composables/useFormValidation';
import { useLoading } from '@/composables/useLoading';
import { useErrorHandler } from '@/composables/useApiError';

const { validateForm, getFormData } = useFormValidation({ email: '' });
const { loading: submitting, withLoading } = useLoading();
const { handleError, handleSuccess } = useErrorHandler();

async function handleSubmit() {
  if (!validateForm()) return;
  
  await withLoading(async () => {
    await api.save(getFormData().email);
    handleSuccess('Sucesso', 'Dados salvos com sucesso!');
  });
}
</script>
```

## 🎨 Estilos e Temas

### Cores do Sistema
- **Sucesso**: `#10b981` (verde)
- **Erro**: `#ef4444` (vermelho)
- **Aviso**: `#f59e0b` (amarelo)
- **Info**: `#3b82f6` (azul)

### Tamanhos de Componentes
- **Small**: 32px altura
- **Medium**: 40px altura (padrão)
- **Large**: 48px altura

## 📱 Responsividade

Todos os componentes são responsivos e se adaptam a diferentes tamanhos de tela:

- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado
- **Mobile**: Layout empilhado com navegação otimizada

## 🧪 Testes

### Testando Notificações
```typescript
import { useNotificationStore } from '@/stores/notifications';

const notificationStore = useNotificationStore();

// Teste de notificação de sucesso
notificationStore.success('Teste', 'Notificação de sucesso funcionando');

// Teste de notificação de erro
notificationStore.error('Erro', 'Notificação de erro funcionando');
```

### Testando Validação
```typescript
import { useFormValidation, validationRules } from '@/composables/useFormValidation';

const { validateForm, setFieldValue } = useFormValidation({ email: '' });

// Teste de validação
setFieldValue('email', 'email-invalido');
const isValid = validateForm(); // Deve retornar false
```

## 🚀 Próximos Passos

1. **Migrar componentes existentes** para usar o novo sistema
2. **Implementar testes unitários** para os novos composables
3. **Adicionar animações** para transições suaves
4. **Implementar temas** (claro/escuro)
5. **Adicionar internacionalização** para mensagens

## 📚 Recursos Adicionais

- [Vue 3 Composition API](https://vuejs.org/guide/composition-api/)
- [Pinia Store](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/) (para estilos)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Nota**: Este sistema foi projetado para ser extensível e fácil de usar. Sinta-se à vontade para sugerir melhorias ou reportar problemas.
