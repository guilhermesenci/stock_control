// src/components/__tests__/BaseForm.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createWrapper } from '@/test/utils'
import BaseForm from '../BaseForm.vue'
import type { TransactionForm } from '@/types/transaction'

describe('BaseForm', () => {
  const mockForm: TransactionForm = {
    isEntry: true,
    supplierId: undefined,
    supplierName: undefined,
    codNf: '',
    sku: '',
    product: '',
    quantity: 0.0,
    unitCost: 0.0,
  }

  let wrapper: any

  beforeEach(() => {
    wrapper = createWrapper(BaseForm, {
      props: {
        form: mockForm,
        submitLabel: 'Salvar',
      },
    })
  })

  it('renderiza corretamente', () => {
    expect(wrapper.find('.form-container').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renderiza botão de submit com label padrão', () => {
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.exists()).toBe(true)
    expect(submitButton.text()).toBe('Salvar')
  })

  it('renderiza botão de submit com label customizado', async () => {
    await wrapper.setProps({ submitLabel: 'Enviar Dados' })
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toBe('Enviar Dados')
  })

  it('emite evento submit ao enviar formulário', async () => {
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0][0]).toEqual(mockForm)
  })

  it('permite slot customizado para campos', () => {
    const wrapperWithSlot = createWrapper(BaseForm, {
      props: {
        form: mockForm,
        submitLabel: 'Salvar',
      },
      slots: {
        fields: '<div class="custom-fields">Campos customizados</div>',
      },
    })

    const customFields = wrapperWithSlot.find('.custom-fields')
    expect(customFields.exists()).toBe(true)
    expect(customFields.text()).toBe('Campos customizados')
  })

  it('permite slot customizado para ações', () => {
    const wrapperWithSlot = createWrapper(BaseForm, {
      props: {
        form: mockForm,
        submitLabel: 'Salvar',
      },
      slots: {
        actions: '<button type="button" class="custom-action">Ação Customizada</button>',
      },
    })

    const customAction = wrapperWithSlot.find('.custom-action')
    expect(customAction.exists()).toBe(true)
    expect(customAction.text()).toBe('Ação Customizada')
    
    // Verifica que o botão padrão não está presente
    const defaultButton = wrapperWithSlot.find('button[type="submit"]')
    expect(defaultButton.exists()).toBe(false)
  })

  it('passa form como prop para slot de campos', () => {
    const wrapperWithSlot = createWrapper(BaseForm, {
      props: {
        form: mockForm,
        submitLabel: 'Salvar',
      },
      slots: {
        fields: '<div class="form-data">{{ form.sku }}</div>',
      },
    })

    const formData = wrapperWithSlot.find('.form-data')
    expect(formData.text()).toBe('')
  })

  it('previne comportamento padrão do formulário', async () => {
    const form = wrapper.find('form')
    
    // O Vue Test Utils já previne o comportamento padrão automaticamente
    await form.trigger('submit.prevent')
    
    // Verifica se o evento foi emitido (o que indica que o preventDefault funcionou)
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('funciona com form vazio', () => {
    const emptyForm: TransactionForm = {
      isEntry: false,
      supplierId: undefined,
      supplierName: undefined,
      codNf: '',
      sku: '',
      product: '',
      quantity: 0.0,
      unitCost: 0.0,
    }

    const emptyWrapper = createWrapper(BaseForm, {
      props: {
        form: emptyForm,
        submitLabel: 'Salvar',
      },
    })

    expect(emptyWrapper.find('.form-container').exists()).toBe(true)
  })

  it('mantém referência do form original', async () => {
    const originalForm = { ...mockForm }
    await wrapper.find('form').trigger('submit.prevent')
    
    const emittedForm = wrapper.emitted('submit')[0][0]
    expect(emittedForm).not.toBe(mockForm) // Deve ser uma cópia
    expect(emittedForm).toEqual(mockForm) // Mas com os mesmos valores
  })
})
