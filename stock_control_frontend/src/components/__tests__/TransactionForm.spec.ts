// src/components/__tests__/TransactionForm.spec.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createWrapper, mockData, mockApiResponses } from '@/test/utils'
import TransactionForm from '../TransactionForm.vue'
import { nextTick } from 'vue'

// Mock dos serviços
vi.mock('@/services/itemService', () => ({
  itemService: {
    searchItems: vi.fn(),
  },
}))

vi.mock('@/services/supplierService', () => ({
  supplierService: {
    searchSuppliers: vi.fn(),
  },
}))

vi.mock('@/services/transactionService', () => ({
  transactionService: {
    createEntradaTransaction: vi.fn(),
    createSaidaTransaction: vi.fn(),
    getCurrentUserInventoryInfo: vi.fn(),
    getNotaFiscalByCodNfAndFornecedor: vi.fn(),
  },
}))

vi.mock('@/services/stockCostService', () => ({
  stockCostService: {
    getStockCosts: vi.fn(),
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1, username: 'testuser' },
    token: 'mock-token',
  }),
}))

describe('TransactionForm', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    wrapper = createWrapper(TransactionForm, {
      props: {},
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renderiza corretamente', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[id="transaction-type"]').exists()).toBe(true)
    expect(wrapper.find('input[id="quantity"]').exists()).toBe(true)
    expect(wrapper.find('input[id="unitCost"]').exists()).toBe(true)
  })

  it('inicializa com valores padrão', () => {
    const form = wrapper.vm.form
    expect(form.isEntry).toBe(true)
    expect(form.quantity).toBe(0.0)
    expect(form.unitCost).toBe(0.0)
    expect(form.sku).toBe('')
    expect(form.product).toBe('')
  })

  it('mostra campo de fornecedor apenas para entradas', async () => {
    // Para entrada (padrão)
    expect(wrapper.find('input[id="supplier"]').exists()).toBe(true)
    
    // Para saída
    wrapper.vm.form.isEntry = false
    await nextTick()
    expect(wrapper.find('input[id="supplier"]').exists()).toBe(false)
  })

  it('mostra campo de NF apenas para entradas', async () => {
    // Para entrada (padrão)
    expect(wrapper.find('input[id="codNf"]').exists()).toBe(true)
    
    // Para saída
    wrapper.vm.form.isEntry = false
    await nextTick()
    expect(wrapper.find('input[id="codNf"]').exists()).toBe(false)
  })

  it('mostra campo de produto apenas quando não está em modo de edição', () => {
    expect(wrapper.find('input[id="product-search"]').exists()).toBe(true)
  })

  it('calcula custo total corretamente', async () => {
    wrapper.vm.form.quantity = 10
    wrapper.vm.form.unitCost = 25.50
    await nextTick()
    
    expect(wrapper.vm.totalCost).toBe(255.0)
    expect(wrapper.vm.formattedTotalCost).toContain('R$ 255,00')
  })

  it('bloqueia edição de custo unitário para saídas', async () => {
    wrapper.vm.form.isEntry = false
    await nextTick()
    
    const unitCostInput = wrapper.find('input[id="unitCost"]')
    expect(unitCostInput.attributes('readonly')).toBeDefined()
    expect(unitCostInput.attributes('disabled')).toBeDefined()
  })

  it('permite edição de custo unitário para entradas', async () => {
    wrapper.vm.form.isEntry = true
    await nextTick()
    
    const unitCostInput = wrapper.find('input[id="unitCost"]')
    expect(unitCostInput.attributes('readonly')).toBeUndefined()
    expect(unitCostInput.attributes('disabled')).toBeUndefined()
  })

    it('mostra botão "Sugerir último" apenas para entradas', async () => {
    // Para entrada (padrão)
    expect(wrapper.find('.btn-suggest').exists()).toBe(true)
    
    // Para saída
    wrapper.vm.form.isEntry = false
    await nextTick()
    expect(wrapper.find('.btn-suggest').exists()).toBe(false)
  })

  it('emite evento submit ao enviar formulário', async () => {
    // Preenche dados mínimos
    wrapper.vm.form.sku = 'SKU001'
    wrapper.vm.form.product = 'Produto Teste'
    wrapper.vm.form.quantity = 10
    wrapper.vm.form.unitCost = 25.50
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('emite evento cancel ao cancelar', async () => {
    await wrapper.find('.cancel-button').trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('valida entrada de NF apenas com números', async () => {
    const nfInput = wrapper.find('input[id="codNf"]')
    
    // Simula entrada com caracteres não numéricos
    await nfInput.setValue('abc123def')
    await nfInput.trigger('input')
    
    expect(wrapper.vm.form.codNf).toBe('123')
  })

  it('reseta formulário corretamente', () => {
    // Preenche alguns dados
    wrapper.vm.form.sku = 'SKU001'
    wrapper.vm.form.quantity = 10
    wrapper.vm.supplierSearch.value = 'Fornecedor Teste'
    
    wrapper.vm.resetForm()
    
    expect(wrapper.vm.form.sku).toBe('')
    expect(wrapper.vm.form.quantity).toBe(0.0)
    expect(wrapper.vm.supplierSearch.value).toBe('')
  })

  it('funciona em modo de edição', async () => {
    const transaction = mockData.transaction
    
    const editWrapper = createWrapper(TransactionForm, {
      props: {
        transaction,
      },
    })
    
    await nextTick()
    
    expect(editWrapper.vm.isEditMode).toBe(true)
    expect(editWrapper.vm.form.sku).toBe(transaction.sku)
    expect(editWrapper.vm.form.product).toBe(transaction.description)
    expect(editWrapper.vm.form.quantity).toBe(transaction.quantity)
  })

  it('mostra botão cancelar apenas em modo de edição', () => {
    // Modo normal
    expect(wrapper.find('.cancel-button').exists()).toBe(false)
    
    // Modo de edição
    const editWrapper = createWrapper(TransactionForm, {
      props: {
        transaction: mockData.transaction,
      },
    })
    
    expect(editWrapper.find('.cancel-button').exists()).toBe(true)
  })

  it('valida campos obrigatórios para entrada', async () => {
    // Tenta submeter sem fornecedor
    wrapper.vm.form.isEntry = true
    wrapper.vm.form.sku = 'SKU001'
    wrapper.vm.form.quantity = 10
    wrapper.vm.form.unitCost = 25.50
    
    // Mock do alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(alertSpy).toHaveBeenCalledWith('Por favor, selecione um fornecedor.')
    
    alertSpy.mockRestore()
  })

  it('valida campos obrigatórios para saída', async () => {
    // Tenta submeter saída sem SKU
    wrapper.vm.form.isEntry = false
    wrapper.vm.form.quantity = 10
    wrapper.vm.form.unitCost = 25.50
    
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    await wrapper.find('form').trigger('submit.prevent')
    
    // Deve validar que tem SKU
    expect(alertSpy).toHaveBeenCalled()
    
    alertSpy.mockRestore()
  })
})
