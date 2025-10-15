// composables/useTransactionForm.ts - Lógica para formulário de transações
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { transactionService } from '@/services/transactionService';
import { stockCostService } from '@/services/stockCostService';
import type { TransactionForm } from '@/types/transaction';
import type { Item } from '@/types/item';
import type { Fornecedor } from '@/services/supplierService';
import { getCurrentISODate } from '@/utils/date';
import api from '@/services/api';

export function useTransactionForm(initialForm?: Partial<TransactionForm>) {
  const authStore = useAuthStore();
  const loading = ref(false);
  const loadingCost = ref(false);

  // Estado do formulário
  const form = ref<TransactionForm>({
    isEntry: true,
    supplierId: undefined,
    supplierName: undefined,
    codNf: '',
    sku: '',
    product: '',
    quantity: 0.0,
    unitCost: 0.0,
    ...initialForm
  });

  // Estado para fornecedor selecionado
  const selectedSupplier = ref<Fornecedor | null>(null);
  
  // Estado para produto selecionado
  const selectedProduct = ref<Item | null>(null);

  // Computed para custo total
  const totalCost = computed(() => form.value.quantity * form.value.unitCost);
  
  const formattedTotalCost = computed(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(totalCost.value);
  });

  // Watch para sincronizar fornecedor selecionado
  watch(selectedSupplier, (supplier) => {
    if (supplier) {
      form.value.supplierId = supplier.codFornecedor;
      form.value.supplierName = supplier.nomeFornecedor;
    } else {
      form.value.supplierId = undefined;
      form.value.supplierName = undefined;
    }
  });

  // Watch para sincronizar produto selecionado
  watch(selectedProduct, (product) => {
    if (product) {
      form.value.sku = product.codSku;
      form.value.product = product.descricaoItem;
    } else {
      form.value.sku = '';
      form.value.product = '';
    }
  });

  // Watch para mudanças no tipo de transação
  watch(() => form.value.isEntry, async (isEntry) => {
    if (!isEntry) {
      // Reset campos específicos de entrada
      form.value.supplierId = undefined;
      form.value.supplierName = undefined;
      form.value.codNf = '';
      selectedSupplier.value = null;
      
      // Atualiza custo unitário para saída
      if (form.value.sku) {
        await updateUnitCostForOutput();
      }
    }
  });

  // Função para obter custo médio
  async function getAverageCost(sku: string): Promise<number> {
    try {
      loadingCost.value = true;
      
      try {
        const { data } = await api.get(`itens/${sku}/custo-medio/`);
        if (data && data.custoMedio !== undefined) {
          return data.custoMedio;
        }
      } catch (apiError) {
        console.error('Erro ao buscar custo médio da API específica:', apiError);
      }

      const response = await stockCostService.getStockCosts(undefined, { sku });
      if (response.results.length > 0) {
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

  // Função para atualizar custo unitário para saída
  async function updateUnitCostForOutput() {
    if (form.value.sku) {
      form.value.unitCost = await getAverageCost(form.value.sku);
    }
  }

  // Função para sugerir último custo (entrada)
  async function suggestLastCost() {
    if (form.value.sku) {
      loadingCost.value = true;
      try {
        const today = getCurrentISODate();
        const cost = await stockCostService.getStockCosts(undefined, { stockDate: today, sku: form.value.sku });
        if (cost.results.length > 0) {
          form.value.unitCost = cost.results[0].lastEntryCost;
        }
      } catch (error) {
        console.error('Erro ao buscar último custo:', error);
      } finally {
        loadingCost.value = false;
      }
    }
  }

  // Função para validar se a operação é válida
  function validateForm(): string | null {
    if (!form.value.sku) {
      return 'Por favor, selecione um produto.';
    }
    
    if (form.value.quantity <= 0) {
      return 'A quantidade deve ser maior que zero.';
    }
    
    if (form.value.unitCost <= 0) {
      return 'O custo unitário deve ser maior que zero.';
    }
    
    if (form.value.isEntry) {
      if (!form.value.supplierId) {
        return 'Por favor, selecione um fornecedor.';
      }
      if (!form.value.codNf) {
        return 'Por favor, informe o número da NF.';
      }
    }
    
    return null;
  }

  // Função para resetar o formulário
  function resetForm() {
    form.value = {
      isEntry: true,
      supplierId: undefined,
      supplierName: undefined,
      codNf: '',
      sku: '',
      product: '',
      quantity: 0.0,
      unitCost: 0.0,
    };
    selectedSupplier.value = null;
    selectedProduct.value = null;
  }

  // Função para submeter o formulário
  async function submitForm(): Promise<void> {
    const validationError = validateForm();
    if (validationError) {
      throw new Error(validationError);
    }

    loading.value = true;
    try {
      const currentUserInfo = await transactionService.getCurrentUserInventoryInfo();
      
      if (!currentUserInfo || !currentUserInfo.id) {
        throw new Error('Não foi possível associar sua conta a um usuário do sistema.');
      }

      if (form.value.isEntry) {
        await transactionService.createEntradaTransaction(
          form.value.sku,
          form.value.quantity,
          form.value.unitCost.toString(),
          currentUserInfo.id,
          form.value.codNf!,
          form.value.supplierId!
        );
      } else {
        await transactionService.createSaidaTransaction(
          form.value.sku,
          form.value.quantity,
          form.value.unitCost.toString(),
          currentUserInfo.id
        );
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    form,
    selectedSupplier,
    selectedProduct,
    loading,
    loadingCost,
    totalCost,
    formattedTotalCost,
    getAverageCost,
    suggestLastCost,
    validateForm,
    resetForm,
    submitForm
  };
}
