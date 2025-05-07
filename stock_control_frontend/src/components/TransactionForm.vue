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
              :options="[
                { value: 'true', text: 'Entrada' }, 
                { value: 'false', text: 'Saída' }
              ]" 
            />
          </div>
  
          <div class="form-group">
            <label for="sku">SKU do Produto:</label>
            <input id="sku" type="text" v-model="form.sku" placeholder="Digite o SKU" required />
          </div>
  
          <div class="form-group">
            <label for="product">Produto:</label>
            <input id="product" type="text" v-model="form.product" readonly placeholder="Selecione o SKU acima" />
          </div>
  
          <div class="form-group">
            <label for="quantity">Quantidade:</label>
            <input id="quantity" type="number" v-model.number="form.quantity" placeholder="Digite a quantidade" required />
          </div>
  
          <!-- Novo campo: Custo unitário com botão -->
          <div class="form-group horizontal">
            <label for="unitCost">Custo unitário:</label>
            <div class="input-with-button">
              <input
                id="unitCost"
                type="number"
                v-model.number="form.unitCost"
                placeholder="0.00"
                step="0.01"
                required
              />
              <button type="button" class="btn-suggest" @click="suggestLastCost">
                Sugerir último
              </button>
            </div>
          </div>
  
          <!-- Novo campo: Custo total da transação (apenas visualização) -->
          <div class="form-group">
            <label>Custo total da transação:</label>
            <output class="output-total">
              {{ formattedTotalCost }}
            </output>
          </div>
        </template>
      </BaseForm>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, computed } from 'vue';
  import BaseForm from '@/components/BaseForm.vue';
  import InputOutputCombobox from '@/components/InputOutputCombobox.vue';
  import type { TransactionForm as TxFormType } from '@/types/transaction';
  
  // inicializa o form com valores padrões
  const form = reactive<TxFormType>({
    isEntry: true,
    sku: '',
    product: '',
    quantity: 0,
    unitCost: 0,
  });
  
  // Computed para custo total
  const totalCost = computed(() => (form.isEntry ? form.quantity * form.unitCost : 0));
  const formattedTotalCost = computed(() => totalCost.value.toFixed(2));
  
  // Simula sugestão de último custo (você pode buscar no serviço real)
  function suggestLastCost() {
    // exemplo fixo; em produção, chame um serviço
    form.unitCost = 42.5;
  }
  
  function handleSubmit(values: TxFormType) {
    console.log('Transação salva:', {
      ...values,
      totalCost: totalCost.value
    });
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
  
      &.horizontal {
        flex-direction: row;
        align-items: center;
  
        label {
          width: 130px;
          margin-right: 0.5rem;
        }
      }
  
      label {
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
  
      input, output {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 100%;
      }
  
      .input-with-button {
        display: flex;
        gap: 0.5rem;
  
        button.btn-suggest {
          padding: 0 1rem;
          border: none;
          background-color: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        button.btn-suggest:hover {
          background-color: #0056b3;
        }
      }
    }
  }
  </style>
  