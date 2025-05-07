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
                :readonly="isUnitCostFrozen"
                :disabled="isUnitCostFrozen || loadingCost.value"
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
  import { reactive, computed, watch } from 'vue';
  import BaseForm from '@/components/BaseForm.vue';
  import InputOutputCombobox from '@/components/InputOutputCombobox.vue';
  import type { TransactionForm as TxFormType } from '@/types/transaction';
  import { itemService } from '@/services/itemService';
  import api from '@/types/api';
  import { transactionService } from '@/services/transactionService';
  
  // inicializa o form com valores padrões
  const form = reactive<TxFormType>({
    isEntry: true,
    sku: '',
    product: '',
    quantity: 0,
    unitCost: 0,
  });
  
  const loadingProduct = reactive({ value: false });
  const loadingCost = reactive({ value: false });
  
  // Computed para custo total
  const totalCost = computed(() => (form.isEntry ? form.quantity * form.unitCost : 0));
  const formattedTotalCost = computed(() => totalCost.value.toFixed(2));
  
  // Campo de custo unitário fica congelado se for saída
  const isUnitCostFrozen = computed(() => form.isEntry === false);
  
  // Busca descrição do produto e custo médio (se for saída) ao digitar SKU
  watch(
    () => [form.sku, form.isEntry],
    async ([sku, isEntry]) => {
      if (!sku) {
        form.product = '';
        if (isUnitCostFrozen.value) form.unitCost = 0;
        return;
      }
      loadingProduct.value = true;
      try {
        // Busca descrição do produto
        const item = await itemService.getItem(String(sku));
        form.product = item.descricaoItem;
      } catch {
        form.product = '';
      } finally {
        loadingProduct.value = false;
      }
      // Se for saída, busca custo médio
      if (!isEntry) {
        loadingCost.value = true;
        try {
          const { data } = await api.get(`/vi/itens/${String(sku)}/custo-medio/`);
          form.unitCost = data.custo_medio;
        } catch {
          form.unitCost = 0;
        } finally {
          loadingCost.value = false;
        }
      }
    },
    { immediate: true }
  );
  
  // Simula sugestão de último custo (entrada)
  function suggestLastCost() {
    // exemplo fixo; em produção, chame um serviço
    form.unitCost = 42.5;
  }
  
  function resetForm() {
    form.isEntry = true;
    form.sku = '';
    form.product = '';
    form.quantity = 0;
    form.unitCost = 0;
  }
  
  async function handleSubmit(values: TxFormType) {
    try {
      if (form.isEntry) {
        // ENTRADA
        await transactionService.createEntrada({
          codEntrada: 0, // será ignorado pelo backend
          codNf: '', // você pode adaptar para pedir nota fiscal
          matUsuario: 1, // adapte para pegar o usuário logado
          dataEntrada: new Date().toISOString().slice(0, 10),
          horaEntrada: new Date().toISOString().slice(11, 19),
        });
      } else {
        // SAÍDA
        await transactionService.createSaida({
          codPedido: 0, // será ignorado pelo backend
          codSku: Number(form.sku),
          qtdSaida: form.quantity,
          matUsuario: 1, // adapte para pegar o usuário logado
          dataSaida: new Date().toISOString().slice(0, 10),
          horaSaida: new Date().toISOString().slice(11, 19),
        });
      }
      alert('Transação salva com sucesso!');
      resetForm();
    } catch (e) {
      alert('Erro ao salvar transação.');
    }
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
  