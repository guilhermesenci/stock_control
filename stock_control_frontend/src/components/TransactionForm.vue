<!-- TransactionForm.vue - Refatorado -->
<template>
  <div>
    <BaseForm
      :form="form"
      submitLabel="Salvar Transação"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <template #fields="{ form }">
        <div class="form-group">
          <InputOutputCombobox
            id="transaction-type"
            label="Tipo de Transação"
            v-model="form.isEntry"
            :options="
              isEditMode
                ? [
                    {
                      value: props.transaction?.transactionType === 'entrada' ? 'true' : 'false',
                      text: props.transaction?.transactionType
                        ? String(props.transaction.transactionType)
                        : '',
                    },
                  ]
                : [
                    { value: 'true', text: 'Entrada' },
                    { value: 'false', text: 'Saída' },
                  ]
            "
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
            <div
              v-if="showSupplierSuggestions && supplierSuggestions.length > 0"
              class="suggestions-list"
            >
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
            @input="
              (e) => {
                handleNfInput(e)
                checkNfExists()
              }
            "
          />
        </div>

        <!-- Unified product search field -->
        <div class="form-group" v-if="!isEditMode">
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
            <div
              v-if="showProductSuggestions && productSuggestions.length > 0"
              class="suggestions-list"
            >
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
              min="0.01"
              required
              :readonly="form.isEntry === false"
              :disabled="form.isEntry === false || loadingCost"
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

      <!-- Botões de ação -->
      <template #actions>
        <div class="actions" :class="{ 'single-button': !isEditMode }">
          <!-- Botão cancelar apenas no modo de edição -->
          <button v-if="isEditMode" type="button" class="cancel-button" @click="handleCancel">
            Cancelar
          </button>
          <button type="submit" class="save-button">
            {{ isEditMode ? 'Salvar Alterações' : 'Salvar Transação' }}
          </button>
        </div>
      </template>
    </BaseForm>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref, onMounted } from 'vue'
import BaseForm from '@/components/BaseForm.vue'
import InputOutputCombobox from '@/components/InputOutputCombobox.vue'
import type { TransactionForm as TxFormType } from '@/types/transaction'
import { itemService } from '@/services/itemService'
import { supplierService } from '@/services/supplierService'
import type { Fornecedor } from '@/services/supplierService'
import api from '@/types/api'
import { transactionService, type FormattedTransaction } from '@/services/transactionService'
import { useAuthStore } from '@/stores/auth'
import { getCurrentISODate } from '@/utils/date'
import { stockCostService } from '@/services/stockCostService'
import { useErrorHandler } from '@/composables/useApiError'

// Props to receive transaction for editing
const props = defineProps<{
  transaction?: FormattedTransaction
}>()

// Definir eventos emitidos pelo componente
const emit = defineEmits<{
  (e: 'submit', transaction: TxFormType): void
  (e: 'cancel'): void
}>()

// Error handler
const { handleError, handleSuccess } = useErrorHandler()

// Inicializa o form com valores padrões
const form = reactive<TxFormType>({
  isEntry: true,
  supplierId: undefined,
  supplierName: undefined,
  codNf: '',
  sku: '',
  product: '',
  quantity: 0.0,
  unitCost: 0.0,
})

const loadingProduct = ref(false)
const loadingCost = ref(false)

// Supplier autocomplete state
const supplierSearch = ref('')
const supplierSuggestions = ref<Fornecedor[]>([])
const showSupplierSuggestions = ref(false)
const supplierSelectedIndex = ref(-1)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Product autocomplete state
const productSearch = ref('')
const productSuggestions = ref<any[]>([])
const showProductSuggestions = ref(false)
const productSelectedIndex = ref(-1)
let productSearchTimeout: ReturnType<typeof setTimeout> | null = null

// Computed para custo total
const totalCost = computed(() => form.quantity * form.unitCost)
const formattedTotalCost = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalCost.value)
})

// Campo de custo unitário fica congelado se for saída
const isUnitCostFrozen = computed(() => !ensureBooleanValue(form.isEntry))

const nfExistsError = ref('')
const checkingNf = ref(false)
let nfCheckTimeout: ReturnType<typeof setTimeout> | null = null

// Sinaliza quando estamos no modo de edição
const isEditMode = ref(false)

// If we have a transaction prop (for editing), populate the form
onMounted(async () => {
  if (props.transaction) {
    console.log('Editing transaction:', props.transaction)

    // Estamos no modo de edição
    isEditMode.value = true

    // Determinar o tipo da transação e converter para formato consistente
    let isEntryValue: boolean
    if (typeof props.transaction.transactionType === 'string') {
      // Pode ser 'entrada', 'saida', 'Entrada' ou 'Saída'
      isEntryValue = props.transaction.transactionType.toLowerCase().includes('entrada')
    } else if (typeof props.transaction.transactionType === 'boolean') {
      // Se por algum motivo receber um boolean diretamente
      isEntryValue = props.transaction.transactionType
    } else {
      // Valor padrão se não for possível determinar
      isEntryValue = false
    }

    // Explicitly set the isEntry value as a boolean to avoid type conversion issues
    form.isEntry = isEntryValue
    form.sku = props.transaction.sku
    form.product = props.transaction.description
    form.quantity = props.transaction.quantity

    // Handle unitCost correctly - debugging unitCost data
    console.log('Transaction object props:', Object.keys(props.transaction))
    console.log('Raw unitCost value:', props.transaction.unitCost)

    // Tenta obter o unitCost de diferentes formas possíveis
    if (props.transaction.unitCost !== undefined) {
      form.unitCost = props.transaction.unitCost
    } else {
      // Se não encontrar, usa o custo total dividido pela quantidade
      console.log('Trying to calculate unitCost from totalCost:', props.transaction.totalCost)
      const unitCost =
        props.transaction.totalCost && props.transaction.quantity
          ? props.transaction.totalCost / props.transaction.quantity
          : 0
      form.unitCost = Math.round(unitCost * 100) / 100
    }

    console.log('Setting unitCost to:', form.unitCost)

    // Update the product search field with the current product
    productSearch.value = `${form.sku} - ${form.product}`

    // If it's an entry transaction, load supplier and NF info
    if (form.isEntry) {
      if (props.transaction.notaFiscal) {
        form.codNf = props.transaction.notaFiscal
      }

      // We need to get supplier info from the transaction
      try {
        // Get the entrada details to find the supplier
        const [type, id] = props.transaction.id.split('-')

        if (type.toLowerCase() === 'entrada') {
          const codEntrada = parseInt(id)

          const { data: entrada } = await api.get(`entradas/${codEntrada}/`)
          const { data: transacao } = await api.get(`transacoes/${entrada.transacao}/`)

          if (transacao.codFornecedor) {
            // Get supplier info
            try {
              const { data: supplier } = await api.get(
                `fornecedores/${transacao.codFornecedor}/`,
              )
              form.supplierId = supplier.codFornecedor
              form.supplierName = supplier.nomeFornecedor
              supplierSearch.value = supplier.nomeFornecedor
            } catch (error) {
              console.error('Error loading supplier info:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error loading transaction details:', error)
      }
    }

    console.log('Form initialized with values:', { ...form, isEntry: form.isEntry })
  }
})

// Handle supplier search with debounce
async function handleSupplierSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!supplierSearch.value) {
    supplierSuggestions.value = []
    showSupplierSuggestions.value = false
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      const results = await supplierService.searchSuppliers(supplierSearch.value)
      supplierSuggestions.value = results.filter((s) => s.active)
      showSupplierSuggestions.value = true
      supplierSelectedIndex.value = -1 // Reset selection when results change
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error)
      supplierSuggestions.value = []
    }
  }, 300)
}

function hideSupplierSuggestions() {
  setTimeout(() => {
    showSupplierSuggestions.value = false
  }, 200)
}

// Handle keyboard navigation for supplier suggestions
function handleSupplierKeydown(event: KeyboardEvent) {
  if (!showSupplierSuggestions.value || !supplierSuggestions.value.length) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (supplierSelectedIndex.value < supplierSuggestions.value.length - 1) {
      supplierSelectedIndex.value++
    } else {
      supplierSelectedIndex.value = 0 // Loop back to the first item
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (supplierSelectedIndex.value > 0) {
      supplierSelectedIndex.value--
    } else {
      supplierSelectedIndex.value = supplierSuggestions.value.length - 1 // Loop to the last item
    }
  } else if (event.key === 'Enter' && supplierSelectedIndex.value >= 0) {
    event.preventDefault()
    selectSupplier(supplierSuggestions.value[supplierSelectedIndex.value])
  } else if (event.key === 'Escape') {
    showSupplierSuggestions.value = false
  }
}

// Select supplier from suggestions
function selectSupplier(supplier: Fornecedor) {
  form.supplierId = supplier.codFornecedor
  form.supplierName = supplier.nomeFornecedor
  supplierSearch.value = supplier.nomeFornecedor
  showSupplierSuggestions.value = false
}

// Handle product search with debounce
async function handleProductSearch() {
  if (productSearchTimeout) {
    clearTimeout(productSearchTimeout)
  }

  if (!productSearch.value) {
    productSuggestions.value = []
    showProductSuggestions.value = false
    form.sku = ''
    form.product = ''
    return
  }

  productSearchTimeout = setTimeout(async () => {
    try {
      // Search both by SKU and description
      const { data } = await api.get(`/api/v1/itens/?search=${productSearch.value}`)
      productSuggestions.value = data.results || []
      showProductSuggestions.value = productSuggestions.value.length > 0
      productSelectedIndex.value = -1 // Reset selection when results change
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      productSuggestions.value = []
    }
  }, 300)
}

function hideProductSuggestions() {
  setTimeout(() => {
    showProductSuggestions.value = false
  }, 200)
}

// Handle keyboard navigation for product suggestions
function handleProductKeydown(event: KeyboardEvent) {
  if (!showProductSuggestions.value || !productSuggestions.value.length) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (productSelectedIndex.value < productSuggestions.value.length - 1) {
      productSelectedIndex.value++
    } else {
      productSelectedIndex.value = 0 // Loop back to the first item
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (productSelectedIndex.value > 0) {
      productSelectedIndex.value--
    } else {
      productSelectedIndex.value = productSuggestions.value.length - 1 // Loop to the last item
    }
  } else if (event.key === 'Enter' && productSelectedIndex.value >= 0) {
    event.preventDefault()
    selectProduct(productSuggestions.value[productSelectedIndex.value])
  } else if (event.key === 'Escape') {
    showProductSuggestions.value = false
  }
}

// Função para encontrar o custo médio de um item usando o stockCostService
async function getAverageCost(sku: string): Promise<number> {
  try {
    loadingCost.value = true
    // Primeiro tenta obter o custo médio da API específica
    try {
      const { data } = await api.get(`/api/v1/itens/${sku}/custo-medio/`)
      if (data && data.custoMedio !== undefined) {
        console.log('Custo médio obtido da API:', data.custoMedio)
        return data.custoMedio
      }
    } catch (apiError) {
      console.error('Erro ao buscar custo médio da API específica:', apiError)
    }

    // Se falhar, tenta o serviço de stockCosts
    const response = await stockCostService.getStockCosts(undefined, { sku })
    if (response.results.length > 0) {
      console.log('Custo médio obtido do stockCostService:', response.results[0].unitCost)
      return response.results[0].unitCost
    }
    return 0
  } catch (error) {
    console.error('Erro ao buscar custo médio:', error)
    return 0
  } finally {
    loadingCost.value = false
  }
}

// Função para garantir que isEntry seja sempre um booleano
function ensureBooleanValue(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    // Handle string values more robustly
    const lowercaseValue = value.toLowerCase()
    return (
      lowercaseValue === 'true' ||
      lowercaseValue === 'entrada' || // For transaction type strings
      lowercaseValue.includes('entrada')
    )
  }
  return Boolean(value)
}

// Select product from suggestions
async function selectProduct(product: any) {
  form.sku = product.codSku
  form.product = product.descricaoItem
  productSearch.value = `${product.codSku} - ${product.descricaoItem}`
  showProductSuggestions.value = false

  // Buscar o custo médio sempre que um produto for selecionado
  // Mas apenas se NÃO estivermos em modo de edição
  if (form.sku && !isEditMode.value) {
    if (!ensureBooleanValue(form.isEntry)) {
      // Para saídas, o custo é sempre o custo médio
      loadingCost.value = true
      form.unitCost = await getAverageCost(form.sku)
      loadingCost.value = false
    } else {
      // Para entradas, preenche com uma sugestão mas permite edição
      loadingCost.value = true
      const lastEntryCost = await stockCostService.getStockCosts(undefined, {
        sku: form.sku,
      })
      console.log('lastEntryCost:', lastEntryCost)
      if (lastEntryCost.results.length > 0) {
        form.unitCost = lastEntryCost.results[0].lastEntryCost
      }
      loadingCost.value = false
    }
  }
}

// Watch for changes in transaction type to reset related fields
watch(
  () => form.isEntry,
  async (isEntry) => {
    console.log('Transaction type changed. isEntry:', isEntry, 'type:', typeof isEntry)

    // Converte para boolean para garantir
    const isEntryBoolean = ensureBooleanValue(isEntry)

    if (!isEntryBoolean) {
      // Reset entry-only fields when switching to output
      form.supplierId = undefined
      form.supplierName = undefined
      form.codNf = ''
      supplierSearch.value = ''

      // Update unit cost for output using stockCostService, mas apenas se não estivermos em modo de edição
      if (form.sku && !isEditMode.value) {
        form.unitCost = await getAverageCost(form.sku)
      }
    }
  },
)

function handleNfInput(event: Event) {
  const input = event.target as HTMLInputElement
  // Remove any non-numeric characters
  input.value = input.value.replace(/[^0-9]/g, '')
  form.codNf = input.value
}

async function checkNfExists() {
  nfExistsError.value = ''
  if (nfCheckTimeout) clearTimeout(nfCheckTimeout)

  if (!form.codNf || !form.supplierId) {
    nfExistsError.value = ''
    return
  }

  checkingNf.value = true
  nfCheckTimeout = setTimeout(async () => {
    const existingNf = await transactionService.getNotaFiscalByCodNfAndFornecedor(
      form.codNf!,
      form.supplierId!,
    )
    if (existingNf) {
      nfExistsError.value = 'Já existe uma Nota Fiscal com esse número para este fornecedor.'
    } else {
      nfExistsError.value = ''
    }
    checkingNf.value = false
  }, 400)
}

function resetForm() {
  form.isEntry = true
  form.supplierId = undefined
  form.supplierName = undefined
  form.codNf = ''
  form.sku = ''
  form.product = ''
  form.quantity = 0.0
  form.unitCost = 0.0
  supplierSearch.value = ''
  productSearch.value = ''
}

async function handleSubmit(values: TxFormType) {
  console.log('TransactionForm: values:', values)
  try {
    const authStore = useAuthStore()

    // Garante que isEntry seja booleano
    const isEntryBoolean = ensureBooleanValue(values.isEntry)
    console.log('Submitting form with isEntry:', isEntryBoolean, 'type:', typeof isEntryBoolean)

    if (!authStore.user?.id) {
      handleError('Usuário não autenticado', 'Por favor, faça login novamente.')
      return
    }

    // Get the current user's inventory usuario information
    let currentUserInfo
    try {
      currentUserInfo = await transactionService.getCurrentUserInventoryInfo()
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error)
      let errorMsg = 'Erro ao buscar informações do usuário.'

      // Check if it's a specific error from the backend
      const err = error as { response?: { data?: { detail?: string } } }
      if (err?.response && err.response.data && err.response.data.detail) {
        errorMsg = err.response.data.detail
      }

      handleError(
        'Erro ao buscar informações do usuário',
        errorMsg + ' Por favor, contate o administrador do sistema.',
      )
      return
    }

    console.log('currentUserInfo', currentUserInfo)

    if (!currentUserInfo || !currentUserInfo.id) {
      handleError(
        'Erro de associação de usuário',
        'Não foi possível associar sua conta a um usuário do sistema. Verifique se o seu usuário tem um registro correspondente na tabela de usuários do inventário.',
      )
      return
    }

    if (isEntryBoolean) {
      // ENTRADA
      if (!values.supplierId) {
        handleError('Fornecedor obrigatório', 'Por favor, selecione um fornecedor.')
        return
      }
      if (!values.codNf) {
        handleError('NF obrigatória', 'Por favor, informe o número da NF.')
        return
      }

      if (!isEditMode.value) {
        const { data: entradasMesmaNFMesmoFornecedor } = await api.get(
          `/api/v1/transacoes/?codNf=${values.codNf}&codFornecedor=${values.supplierId}`,
        )
        console.log('entradasMesmaNFMesmoFornecedor:', entradasMesmaNFMesmoFornecedor)
        if (entradasMesmaNFMesmoFornecedor.results.length > 0) {
          handleError('NF duplicada', 'Já existe uma entrada com a mesma NF e fornecedor')
          return
        }
      }
      if (!isEditMode.value) {
        await transactionService.createEntradaTransaction(
          values.sku,
          values.quantity,
          values.unitCost.toString(),
          currentUserInfo.id,
          values.codNf,
          values.supplierId,
        )
        handleSuccess('Transação salva', 'Transação de entrada salva com sucesso!')
      }
    } else {
      // SAÍDA
      try {
        if (!isEditMode.value) {
          await transactionService.createSaidaTransaction(
            values.sku,
            values.quantity,
            values.unitCost.toString(),
            currentUserInfo.id,
          )
          handleSuccess('Transação salva', 'Transação de saída salva com sucesso!')
        }
      } catch (error: any) {
        // Check for insufficient stock error
        if (error.response && error.response.data && error.response.data.detail) {
          handleError('Erro na transação', error.response.data.detail)
        } else {
          throw error // Re-throw if it's not the specific error we're handling
        }
        return
      }
    }
    emit('submit', values)
    resetForm()
  } catch (e) {
    console.error('Erro ao salvar transação:', e)
    handleError('Erro ao salvar transação', 'Por favor, tente novamente.')
  }
}

// Função para tratar o cancelamento do formulário
function handleCancel() {
  console.log('Cancelling form')
  emit('cancel')
}

// Simula sugestão de último custo (entrada)
function suggestLastCost() {
  if (form.sku) {
    // Removed 'today' as the first argument since it expects a number, not a string
    stockCostService.getStockCosts(undefined, { sku: form.sku }).then((cost) => {
      if (cost.results.length > 0) {
        form.unitCost = cost.results[0].lastEntryCost
      }
    })
  }
}

// Função para garantir que o campo de custo unitário não seja editado em saídas
function validateUnitCost(event: Event) {
  console.log('Current isEntry value:', form.isEntry, 'type:', typeof form.isEntry)

  const isEntryBoolean = ensureBooleanValue(form.isEntry)

  // Se estivermos editando uma saída, só bloqueia a edição se NÃO estivermos no modo de edição
  if (!isEntryBoolean && !isEditMode.value) {
    console.log('Blocking edit attempt on unitCost for output transaction')
    // Restaura o valor anterior se tentar editar em modo saída
    if (form.sku) {
      getAverageCost(form.sku).then((cost) => {
        form.unitCost = cost
      })
    }
    // Previne a edição
    event.preventDefault()
    event.stopPropagation()
  }
}
</script>
