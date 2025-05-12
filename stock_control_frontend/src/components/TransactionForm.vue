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
  
          <!-- Supplier field (only shown for entries) -->
          <div v-if="form.isEntry === true" class="form-group">
            <label for="supplier">Fornecedor:</label>
            <div class="autocomplete-container">
              <input 
                id="supplier" 
                type="text" 
                v-model="supplierSearch" 
                @input="handleSupplierSearch"
                @keydown="handleSupplierKeydown"
                @focus="showSupplierSuggestions = supplierSuggestions.length > 0"
                @blur="hideSupplierSuggestions"
                placeholder="Digite o nome do fornecedor"
                autocomplete="off"
                required
              />
              <div v-if="showSupplierSuggestions && supplierSuggestions.length > 0" class="suggestions-list">
                <div 
                  v-for="(supplier, index) in supplierSuggestions" 
                  :key="supplier.codFornecedor"
                  :class="['suggestion-item', { active: supplierSelectedIndex === index }]"
                  @click="selectSupplier(supplier)"
                  @mouseover="supplierSelectedIndex = index"
                >
                  {{ supplier.nomeFornecedor }}
                </div>
              </div>
            </div>
          </div>
  
          <!-- NF Number field (only shown for entries) -->
          <div v-if="form.isEntry === true" class="form-group">
            <label for="codNf">Número NF:</label>
            <input 
              id="codNf" 
              type="text" 
              v-model="form.codNf" 
              placeholder="Digite o número da NF" 
              autocomplete="off"
              required
              pattern="[0-9]*"
              @input="e => { handleNfInput(e); checkNfExists(); }"
            />
          </div>
  
          <!-- Unified product search field -->
          <div class="form-group">
            <label for="product-search">Produto:</label>
            <div class="autocomplete-container">
              <input 
                id="product-search" 
                type="text" 
                v-model="productSearch" 
                @input="handleProductSearch"
                @keydown="handleProductKeydown"
                @focus="showProductSuggestions = productSuggestions.length > 0"
                @blur="hideProductSuggestions"
                placeholder="Digite o SKU ou nome do produto"
                autocomplete="off"
                required
              />
              <div v-if="showProductSuggestions && productSuggestions.length > 0" class="suggestions-list">
                <div 
                  v-for="(product, index) in productSuggestions" 
                  :key="product.codSku"
                  :class="['suggestion-item', { active: productSelectedIndex === index }]"
                  @click="selectProduct(product)"
                  @mouseover="productSelectedIndex = index"
                >
                  {{ product.codSku }} - {{ product.descricaoItem }}
                </div>
              </div>
            </div>
          </div>
  
          <div class="form-group">
            <label for="quantity">Quantidade:</label>
            <input id="quantity" type="number" v-model.number="form.quantity" placeholder="Digite a quantidade" required />
          </div>
  
          <!-- Custo unitário com botão "Sugerir último" apenas para entradas -->
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
                :readonly="form.isEntry === false"
                :disabled="form.isEntry === false || loadingCost.value"
                :class="{ 'readonly-field': form.isEntry === false }"
                @input="validateUnitCost"
              />
              <button 
                v-if="form.isEntry === true" 
                type="button" 
                class="btn-suggest" 
                @click="suggestLastCost"
              >
                Sugerir último
              </button>
            </div>
          </div>
  
          <!-- Custo total da transação -->
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
  import { reactive, computed, watch, ref, onMounted } from 'vue';
  import BaseForm from '@/components/BaseForm.vue';
  import InputOutputCombobox from '@/components/InputOutputCombobox.vue';
  import type { TransactionForm as TxFormType } from '@/types/transaction';
  import { itemService } from '@/services/itemService';
  import { supplierService } from '@/services/supplierService';
  import type { Fornecedor } from '@/services/supplierService';
  import api from '@/types/api';
  import { transactionService, type FormattedTransaction } from '@/services/transactionService';
  import { useAuthStore } from '@/stores/auth';
  import { stockCostService } from '@/services/stockCostService';
  
  // Props to receive transaction for editing
  const props = defineProps<{
    transaction?: FormattedTransaction
  }>();
  
  // Inicializa o form com valores padrões
  const form = reactive<TxFormType>({
    isEntry: true,
    supplierId: undefined,
    supplierName: undefined,
    codNf: '',
    sku: '',
    product: '',
    quantity: 0,
    unitCost: 0,
  });
  
  const loadingProduct = reactive({ value: false });
  const loadingCost = reactive({ value: false });
  
  // Supplier autocomplete state
  const supplierSearch = ref('');
  const supplierSuggestions = ref<Fornecedor[]>([]);
  const showSupplierSuggestions = ref(false);
  const supplierSelectedIndex = ref(-1);
  let searchTimeout: number | null = null;

  // Product autocomplete state
  const productSearch = ref('');
  const productSuggestions = ref<any[]>([]);
  const showProductSuggestions = ref(false);
  const productSelectedIndex = ref(-1);
  let productSearchTimeout: number | null = null;
  
  // Computed para custo total
  const totalCost = computed(() => form.quantity * form.unitCost);
  const formattedTotalCost = computed(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(totalCost.value);
  });
  
  // Campo de custo unitário fica congelado se for saída
  const isUnitCostFrozen = computed(() => !ensureBooleanValue(form.isEntry));
  
  const nfExistsError = ref('');
  const checkingNf = ref(false);
  let nfCheckTimeout: number | null = null;
  
  // If we have a transaction prop (for editing), populate the form
  onMounted(() => {
    if (props.transaction) {
      // Populate form with transaction data
      form.isEntry = props.transaction.transactionType === 'entrada';
      form.sku = props.transaction.sku;
      form.product = props.transaction.description;
      form.quantity = props.transaction.quantity;
      form.unitCost = props.transaction.unitCost;
      
      if (form.isEntry && props.transaction.notaFiscal) {
        form.codNf = props.transaction.notaFiscal;
        // We should also set the supplierId but we don't have that in the transaction object
      }

      // Update the product search field with the current product
      productSearch.value = `${form.sku} - ${form.product}`;
    }
  });
  
  // Handle supplier search with debounce
  async function handleSupplierSearch() {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (!supplierSearch.value) {
      supplierSuggestions.value = [];
      showSupplierSuggestions.value = false;
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      try {
        const results = await supplierService.searchSuppliers(supplierSearch.value);
        supplierSuggestions.value = results.filter(s => s.active);
        showSupplierSuggestions.value = true;
        supplierSelectedIndex.value = -1; // Reset selection when results change
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        supplierSuggestions.value = [];
      }
    }, 300);
  }
  
  function hideSupplierSuggestions() {
    setTimeout(() => {
      showSupplierSuggestions.value = false;
    }, 200);
  }
  
  // Handle keyboard navigation for supplier suggestions
  function handleSupplierKeydown(event: KeyboardEvent) {
    if (!showSupplierSuggestions.value || !supplierSuggestions.value.length) return;
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (supplierSelectedIndex.value < supplierSuggestions.value.length - 1) {
        supplierSelectedIndex.value++;
      } else {
        supplierSelectedIndex.value = 0; // Loop back to the first item
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (supplierSelectedIndex.value > 0) {
        supplierSelectedIndex.value--;
      } else {
        supplierSelectedIndex.value = supplierSuggestions.value.length - 1; // Loop to the last item
      }
    } else if (event.key === 'Enter' && supplierSelectedIndex.value >= 0) {
      event.preventDefault();
      selectSupplier(supplierSuggestions.value[supplierSelectedIndex.value]);
    } else if (event.key === 'Escape') {
      showSupplierSuggestions.value = false;
    }
  }
  
  // Select supplier from suggestions
  function selectSupplier(supplier: Fornecedor) {
    form.supplierId = supplier.codFornecedor;
    form.supplierName = supplier.nomeFornecedor;
    supplierSearch.value = supplier.nomeFornecedor;
    showSupplierSuggestions.value = false;
  }

  // Handle product search with debounce
  async function handleProductSearch() {
    if (productSearchTimeout) {
      clearTimeout(productSearchTimeout);
    }
    
    if (!productSearch.value) {
      productSuggestions.value = [];
      showProductSuggestions.value = false;
      form.sku = '';
      form.product = '';
      return;
    }
    
    productSearchTimeout = setTimeout(async () => {
      try {
        // Search both by SKU and description
        const { data } = await api.get(`/api/v1/itens/?search=${productSearch.value}`);
        productSuggestions.value = data.results || [];
        showProductSuggestions.value = productSuggestions.value.length > 0;
        productSelectedIndex.value = -1; // Reset selection when results change
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        productSuggestions.value = [];
      }
    }, 300);
  }
  
  function hideProductSuggestions() {
    setTimeout(() => {
      showProductSuggestions.value = false;
    }, 200);
  }
  
  // Handle keyboard navigation for product suggestions
  function handleProductKeydown(event: KeyboardEvent) {
    if (!showProductSuggestions.value || !productSuggestions.value.length) return;
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (productSelectedIndex.value < productSuggestions.value.length - 1) {
        productSelectedIndex.value++;
      } else {
        productSelectedIndex.value = 0; // Loop back to the first item
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (productSelectedIndex.value > 0) {
        productSelectedIndex.value--;
      } else {
        productSelectedIndex.value = productSuggestions.value.length - 1; // Loop to the last item
      }
    } else if (event.key === 'Enter' && productSelectedIndex.value >= 0) {
      event.preventDefault();
      selectProduct(productSuggestions.value[productSelectedIndex.value]);
    } else if (event.key === 'Escape') {
      showProductSuggestions.value = false;
    }
  }

  // Função para encontrar o custo médio de um item usando o stockCostService
  async function getAverageCost(sku: string): Promise<number> {
    try {
      loadingCost.value = true;
      // Primeiro tenta obter o custo médio da API específica
      try {
        const { data } = await api.get(`/api/v1/itens/${String(sku)}/custo-medio/`);
        if (data && data.custoMedio !== undefined) {
          console.log('Custo médio obtido da API:', data.custoMedio);
          return data.custoMedio;
        }
      } catch (apiError) {
        console.error('Erro ao buscar custo médio da API específica:', apiError);
      }

      // Se falhar, tenta o serviço de stockCosts
      const response = await stockCostService.getStockCosts(undefined, { sku });
      if (response.results.length > 0) {
        console.log('Custo médio obtido do stockCostService:', response.results[0].unitCost);
        return response.results[0].unitCost;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao buscar custo médio:', error);
      return 0;
    } finally {
      loadingCost.value = false;
    }
  }

  // Função para garantir que isEntry seja sempre um booleano
  function ensureBooleanValue(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return Boolean(value);
  }

  // Select product from suggestions
  async function selectProduct(product: any) {
    form.sku = product.codSku;
    form.product = product.descricaoItem;
    productSearch.value = `${product.codSku} - ${product.descricaoItem}`;
    showProductSuggestions.value = false;

    // Buscar o custo médio sempre que um produto for selecionado
    if (form.sku) {
      if (!ensureBooleanValue(form.isEntry)) {
        // Para saídas, o custo é sempre o custo médio
        form.unitCost = await getAverageCost(form.sku);
      } else {
        // Para entradas, preenche com uma sugestão mas permite edição
        const lastEntryCost = await stockCostService.getStockCosts(new Date().toISOString().split('T')[0], { codSku: form.sku });
        if (lastEntryCost.results.length > 0) {
          form.unitCost = lastEntryCost.results[0].lastEntryCost;
        }
      }
    }
  }
  
  // Watch for changes in transaction type to reset related fields
  watch(() => form.isEntry, async (isEntry) => {
    console.log('Transaction type changed. isEntry:', isEntry, 'type:', typeof isEntry);
    
    // Converte para boolean para garantir
    const isEntryBoolean = ensureBooleanValue(isEntry);
    
    if (!isEntryBoolean) {
      // Reset entry-only fields when switching to output
      form.supplierId = undefined;
      form.supplierName = undefined;
      form.codNf = '';
      supplierSearch.value = '';
      
      // Update unit cost for output using stockCostService
      if (form.sku) {
        form.unitCost = await getAverageCost(form.sku);
      }
    }
  });
  
  function handleNfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
    form.codNf = input.value;
  }
  
  async function checkNfExists() {
    nfExistsError.value = '';
    if (nfCheckTimeout) clearTimeout(nfCheckTimeout);

    if (!form.codNf || !form.supplierId) {
      nfExistsError.value = '';
      return;
    }

    checkingNf.value = true;
    nfCheckTimeout = setTimeout(async () => {
      const existingNf = await transactionService.getNotaFiscalByCodNfAndFornecedor(form.codNf!, form.supplierId!);
      if (existingNf) {
        nfExistsError.value = 'Já existe uma Nota Fiscal com esse número para este fornecedor.';
      } else {
        nfExistsError.value = '';
      }
      checkingNf.value = false;
    }, 400);
  }
  
  function resetForm() {
    form.isEntry = true;
    form.supplierId = undefined;
    form.supplierName = undefined;
    form.codNf = '';
    form.sku = '';
    form.product = '';
    form.quantity = 0;
    form.unitCost = 0;
    supplierSearch.value = '';
    productSearch.value = '';
  }
  
  async function handleSubmit(values: TxFormType) {
    try {
      const authStore = useAuthStore();
      
      // Garante que isEntry seja booleano
      const isEntryBoolean = ensureBooleanValue(values.isEntry);
      console.log('Submitting form with isEntry:', isEntryBoolean, 'type:', typeof isEntryBoolean);
      
      if (!authStore.user?.id) {
        alert('Usuário não autenticado. Por favor, faça login novamente.');
        return;
      }

      // Get the current user's inventory usuario information
      let currentUserInfo;
      try {
        currentUserInfo = await transactionService.getCurrentUserInventoryInfo();
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
        alert('Erro ao buscar informações do usuário. Por favor, tente novamente.');
        return;
      }

      console.log('currentUserInfo', currentUserInfo);

      if (!currentUserInfo || !currentUserInfo.matUsuario) {
        alert('Não foi possível associar sua conta a um usuário do sistema. Por favor, contate o administrador.');
        return;
      }

      if (isEntryBoolean) {
        // ENTRADA
        if (!values.supplierId) {
          alert('Por favor, selecione um fornecedor.');
          return;
        }
        if (!values.codNf) {
          alert('Por favor, informe o número da NF.');
          return;
        }

        // VERIFICAÇÃO PRÉVIA
        const existingNf = await transactionService.getNotaFiscalByCodNf(values.codNf);
        if (existingNf) {
          alert('Já existe uma Nota Fiscal com esse número. Por favor, escolha outro número.');
          return;
        }

        await transactionService.createEntradaTransaction(
          Number(values.sku),
          values.quantity,
          values.unitCost.toString(),
          currentUserInfo.matUsuario,
          values.codNf,
          values.supplierId
        );
        alert('Transação de entrada salva com sucesso!');
      } else {
        // SAÍDA
        try {
          await transactionService.createSaidaTransaction(
            Number(values.sku),
            values.quantity,
            values.unitCost.toString(),
            currentUserInfo.matUsuario
          );
          alert('Transação de saída salva com sucesso!');
        } catch (error: any) {
          // Check for insufficient stock error
          if (error.response && error.response.data && error.response.data.detail) {
            alert(error.response.data.detail);
          } else {
            throw error; // Re-throw if it's not the specific error we're handling
          }
          return;
        }
      }
      resetForm();
    } catch (e) {
      console.error('Erro ao salvar transação:', e);
      alert('Erro ao salvar transação. Por favor, tente novamente.');
    }
  }
  
  // Simula sugestão de último custo (entrada)
  function suggestLastCost() {
    if (form.sku) {
      const today = new Date().toISOString().split('T')[0];
      stockCostService.getStockCosts(today, { codSku: form.sku }).then(cost => {
        if (cost.results.length > 0) {
          form.unitCost = cost.results[0].lastEntryCost;
        }
      });
    }
  }

  // Função para garantir que o campo de custo unitário não seja editado em saídas
  function validateUnitCost(event: Event) {
    console.log('Current isEntry value:', form.isEntry, 'type:', typeof form.isEntry);
    
    const isEntryBoolean = ensureBooleanValue(form.isEntry);
    
    if (!isEntryBoolean) {
      console.log('Blocking edit attempt on unitCost for output transaction');
      // Restaura o valor anterior se tentar editar em modo saída
      if (form.sku) {
        getAverageCost(form.sku).then(cost => {
          form.unitCost = cost;
        });
      }
      // Previne a edição
      event.preventDefault();
      event.stopPropagation();
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

    .autocomplete-container {
      position: relative;
      
      .suggestions-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        
        .suggestion-item {
          padding: 0.5rem;
          cursor: pointer;
          
          &:hover, &.active {
            background-color: #f0f0f0;
          }
          
          &.active {
            background-color: #e0e0e0;
          }
        }
      }
    }

    .readonly-field {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
  </style>
  