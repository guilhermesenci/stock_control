<template>
    <div class="transactions-view view">
      <h1>Registro de Transações</h1>
      <!-- Edit Transaction Modal -->
      <div class="modal-backdrop" v-if="showEditTransactionModal">
        <div class="modal form-container">
          <h2>Editar Transação</h2>
          <TransactionForm :isEditMode="true" :transaction="transactionToEdit || undefined" @submit="onEditTransactionSave" @cancel="showEditTransactionModal = false" />
        </div>
      </div>
      
      <div class="transactions-filters filter-container">
        <h2>Filtros</h2>
        <TransactionsFilters v-model="filters" @search="onSearch" />
      </div>
      
      <div class="transactions-list list-container">
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
    transaction.id = transactionToEdit.value?.id
    transaction.idTransacao = transactionToEdit.value?.cronology
    try {
      await transactionService.updateTransaction(transaction as FormattedTransaction);
      showEditTransactionModal.value = false;
      onSearch();
      transactionToEdit.value = null;
      // reload the page
      // window.location.reload();
    } catch (err) {
      console.error('Erro ao editar transação:', err);
      alert('Erro ao editar transação: ' + err);
      showEditTransactionModal.value = false;
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