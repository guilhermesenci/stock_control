<!-- TransactionFormRefactored.vue - Versão refatorada do formulário de transações -->
<template>
  <div>
    <BaseForm :form="form" submitLabel="Salvar Transação" @submit="handleSubmit" @cancel="handleCancel">
      <template #fields="{ form }">
        <!-- Tipo de Transação -->
        <div class="form-group">
          <InputOutputCombobox 
            id="transaction-type" 
            label="Tipo de Transação" 
            v-model="form.isEntry" 
            :options="isEditMode ? [
              { value: props.transaction?.transactionType === 'entrada' ? 'true' : 'false', text: props.transaction?.transactionType ?? '' }, 
            ] : [
              { value: 'true', text: 'Entrada' }, 
              { value: 'false', text: 'Saída' }
            ]"
          />
        </div>

        <!-- Fornecedor (apenas para entradas) -->
        <SupplierSelector
          v-if="form.isEntry === true"
          v-model="selectedSupplier"
          :disabled="isEditMode"
        />

        <!-- Número NF (apenas para entradas e não em modo de edição) -->
        <div v-if="form.isEntry === true && !isEditMode" class="form-group">
          <label for="codNf">Número NF:</label>
          <input 
            id="codNf" 
            type="text" 
            v-model="form.codNf" 
            placeholder="Digite o número da NF" 
            autocomplete="off"
            required
            pattern="[0-9]*"
            @input="handleNfInput"
          />
        </div>

        <!-- Produto (apenas se não estiver em modo de edição) -->
        <ProductSelector
          v-if="!isEditMode"
          v-model="selectedProduct"
        />

        <!-- Quantidade -->
        <div class="form-group">
          <label for="quantity">Quantidade:</label>
          <input 
            id="quantity" 
            type="number" 
            v-model.number="form.quantity" 
            placeholder="Digite a quantidade" 
            step="0.01" 
            min="0.01" 
            required 
          />
        </div>

        <!-- Custo Unitário -->
        <UnitCostField
          v-model="form.unitCost"
          :readonly="form.isEntry === false && !isEditMode"
          :disabled="form.isEntry === false && !isEditMode"
          :loading="loadingCost"
          :show-suggest-button="form.isEntry === true"
          @suggest="suggestLastCost"
        />

        <!-- Custo Total -->
        <div class="form-group">
          <label>Custo total da transação:</label>
          <output class="output-total">
            {{ formattedTotalCost }}
          </output>
        </div>
      </template>

      <!-- Botões de ação -->
      <template #actions>
        <div class="actions" :class="{ 'single-button': !isEditMode }">
          <button v-if="isEditMode" type="button" class="cancel-button" @click="handleCancel">
            Cancelar
          </button>
          <button type="submit" class="save-button" :disabled="loading">
            {{ isEditMode ? 'Salvar Alterações' : 'Salvar Transação' }}
          </button>
        </div>
      </template>
    </BaseForm>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BaseForm from '@/components/BaseForm.vue';
import InputOutputCombobox from '@/components/InputOutputCombobox.vue';
import SupplierSelector from '@/components/forms/SupplierSelector.vue';
import ProductSelector from '@/components/forms/ProductSelector.vue';
import UnitCostField from '@/components/forms/UnitCostField.vue';
import { useTransactionForm } from '@/composables/useTransactionForm';
import { useErrorHandler } from '@/composables/useApiError';
import type { TransactionForm as TxFormType } from '@/types/transaction';
import type { FormattedTransaction } from '@/services/transactionService';

// Props para receber transação para edição
const props = defineProps<{
  transaction?: FormattedTransaction;
}>();

// Emits
const emit = defineEmits<{
  (e: 'submit', transaction: TxFormType): void;
  (e: 'cancel'): void;
}>();

// Sinaliza quando estamos no modo de edição
const isEditMode = ref(false);

// Error handler
const { handleError } = useErrorHandler();

// Usa o composable para gerenciar o formulário
const {
  form,
  selectedSupplier,
  selectedProduct,
  loading,
  loadingCost,
  formattedTotalCost,
  suggestLastCost,
  resetForm,
  submitForm
} = useTransactionForm();

// Inicializa o formulário se estivermos editando
onMounted(async () => {
  if (props.transaction) {
    isEditMode.value = true;
    
    // Preenche o formulário com dados da transação
    form.value.isEntry = props.transaction.transactionType === 'entrada';
    form.value.sku = props.transaction.sku;
    form.value.product = props.transaction.description;
    form.value.quantity = props.transaction.quantity;
    form.value.unitCost = props.transaction.unitCost;
    
    // Se for entrada, carrega dados do fornecedor
    if (form.value.isEntry && props.transaction.notaFiscal) {
      form.value.codNf = props.transaction.notaFiscal;
    }
  }
});

// Função para tratar input da NF
function handleNfInput(event: Event) {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, '');
  form.value.codNf = input.value;
}

// Função para submeter o formulário
async function handleSubmit(values: TxFormType) {
  try {
    await submitForm();
    emit('submit', values);
    resetForm();
  } catch (error: any) {
    handleError(error, 'Erro ao salvar transação');
  }
}

// Função para cancelar
function handleCancel() {
  emit('cancel');
}
</script>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.actions.single-button {
  justify-content: center;
}

.output-total {
  font-weight: bold;
  font-size: 1.1em;
  color: #007bff;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.save-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>
