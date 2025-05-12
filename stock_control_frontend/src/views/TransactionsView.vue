<template>
  <div class="transactions-view">
    <h1>Registro de Transações</h1>
    <button class="btn-new-transaction" @click="showNewTransactionModal = true">Nova Transação</button>
    
    <!-- New Transaction Modal -->
    <div v-if="showNewTransactionModal" class="modal">
      <div class="modal-content">
        <h2>Nova Transação</h2>
        <button class="close-btn" @click="showNewTransactionModal = false">&times;</button>
        <TransactionForm @submit="onNewTransactionSave" />
      </div>
    </div>
    
    <!-- Edit Transaction Modal -->
    <div v-if="showEditTransactionModal" class="modal">
      <div class="modal-content">
        <h2>Editar Transação</h2>
        <button class="close-btn" @click="showEditTransactionModal = false">&times;</button>
        <TransactionForm :transaction="transactionToEdit || undefined" @submit="onEditTransactionSave" />
      </div>
    </div>
    
    <div class="transactions-filters">
      <h2>Filtros</h2>
      <TransactionsFilters v-model="filters" @search="onSearch" />
    </div>
    
    <div class="transactions-list">
      <h2>Lista de Transações</h2>
      <TransactionsList :filters="filters" :refreshKey="refreshKey" @edit="onEditTransaction" @delete="onDeleteTransaction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import TransactionsFilters from '@/components/TransactionsFilters.vue'
import TransactionsList from '@/components/TransactionsList.vue'
import TransactionForm from '@/components/TransactionForm.vue'
import { transactionService, type FormattedTransaction } from '@/services/transactionService'

// Estado para filtros
interface TransactionFilters {
  transactionsDateFrom: string;
  transactionsDateTo: string;
  itemSKU: string;
  itemDescription: string;
  notaFiscal: string;
}

// Inicializar com a data de hoje
const today = new Date().toISOString().split('T')[0];

// Estado dos filtros
const filters = ref<TransactionFilters>({
  transactionsDateFrom: today,
  transactionsDateTo: today,
  itemSKU: '',
  itemDescription: '',
  notaFiscal: ''
});

// Chave reativa para forçar reload
const refreshKey = ref(0);

// Controle dos modais
const showNewTransactionModal = ref(false);
const showEditTransactionModal = ref(false);
const transactionToEdit = ref<FormattedTransaction | null>(null);

// Quando o usuário clica em buscar
function onSearch() {
  console.log('TransactionsView: onSearch called');
  console.log('TransactionsView: Filtros atuais:', filters.value);
  
  // Incrementa para disparar watcher em TransactionsList
  refreshKey.value++;
  console.log('TransactionsView: refreshKey incrementado para:', refreshKey.value);
}

// Salvar nova transação
async function onNewTransactionSave(transaction: any) {
  try {
    // A implementação real de salvar está no TransactionForm
    showNewTransactionModal.value = false;
    onSearch();
  } catch (err) {
    console.error('Erro ao cadastrar transação:', err);
  }
}

// Editar transação
function onEditTransaction(transaction: any) {
  transactionToEdit.value = { ...transaction };
  showEditTransactionModal.value = true;
}

// Salvar edição de transação
async function onEditTransactionSave(transaction: any) {
  try {
    await transactionService.updateTransaction(transaction as FormattedTransaction);
    showEditTransactionModal.value = false;
    onSearch();
  } catch (err) {
    console.error('Erro ao editar transação:', err);
    alert('Erro ao editar transação: ' + err);
  }
}

// Deletar transação
async function onDeleteTransaction(transaction: any) {
  if (confirm(`Tem certeza que deseja deletar esta transação?`)) {
    try {
      await transactionService.deleteTransaction(transaction.id);
      alert('Transação excluída com sucesso!');
      onSearch();
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
      alert('Erro ao deletar transação: ' + err);
    }
  }
}
</script>

<style scoped>
.btn-new-transaction {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-new-transaction:hover {
  background: #218838;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
  background: none;
  border: none;
}
</style> 