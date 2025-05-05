<!-- TransactionForm.vue -->
<template>
    <div class="transaction-form-container">
      <BaseForm :form="form" submitLabel="Salvar Transação" @submit="handleSubmit">
        <template #fields="{ form }">
          <div class="form-group">
            <InputOutputCombobox 
              id="transaction-type" 
              label="Tipo de Transação" 
              v-model="form.isEntry" 
              :options="[{ value: 'Entrada', text: 'Entrada' }, { value: 'Saída', text: 'Saída' }]" 
            />
          </div>
  
          <div class="form-group">
            <label>SKU do Produto:</label>
            <input type="text" v-model="form.sku" placeholder="Digite o SKU" required />
          </div>
  
          <div class="form-group">
            <label>Produto:</label>
            <input type="text" v-model="form.product" readonly placeholder="Selecione o SKU acima" />
          </div>
  
          <div class="form-group">
            <label>Quantidade:</label>
            <input type="number" v-model="form.quantity" placeholder="Digite a quantidade" required />
          </div>
        </template>
      </BaseForm>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive } from 'vue';
  import BaseForm from '@/components/BaseForm.vue';
  import InputOutputCombobox from '@/components/InputOutputCombobox.vue';
  import type { TransactionForm as TxFormType } from '@/types/transaction';
  
  // inicializa o form com valores padrões
  const form = reactive<TxFormType>({
    isEntry: true,
    sku: '',
    product: '',
    quantity: 0,
  });
  
  function handleSubmit(values: TxFormType) {
    console.log('Transação salva:', values);
    // aqui você chama seu serviço de criação, limpa o form, etc.
  }
  </script>
  
  <style scoped lang="scss">
  .transaction-form-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
    h1 {
      text-align: center;
      margin-bottom: 1rem;
    }
  
    .form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
  
      label {
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
  
      input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
    }
  }
  </style>
  