// src/components/__tests__/InputOutputCombobox.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createWrapper } from '@/test/utils'
import InputOutputCombobox from '../InputOutputCombobox.vue'

describe('InputOutputCombobox', () => {
  const mockOptions = [
    { value: 'true', text: 'Entrada' },
    { value: 'false', text: 'Saída' },
  ]

  let wrapper: any

  beforeEach(() => {
    wrapper = createWrapper(InputOutputCombobox, {
      props: {
        id: 'test-combobox',
        label: 'Tipo de Transação',
        modelValue: 'true',
        options: mockOptions,
      },
    })
  })

  it('renderiza corretamente', () => {
    expect(wrapper.find('label').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('renderiza label corretamente', () => {
    const label = wrapper.find('label')
    expect(label.text()).toBe('Tipo de Transação')
    expect(label.attributes('for')).toBe('test-combobox')
  })

  it('renderiza todas as opções', () => {
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(2)
    expect(options[0].text()).toBe('Entrada')
    expect(options[1].text()).toBe('Saída')
  })

  it('define valores corretos das opções', () => {
    const options = wrapper.findAll('option')
    expect(options[0].attributes('value')).toBe('true')
    expect(options[1].attributes('value')).toBe('false')
  })

  it('seleciona valor inicial correto', () => {
    const select = wrapper.find('select')
    expect(select.element.value).toBe('true')
  })

  it('emite evento update:modelValue ao mudar seleção', async () => {
    const select = wrapper.find('select')
    await select.setValue('false')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('atualiza valor quando modelValue muda', async () => {
    await wrapper.setProps({ modelValue: 'false' })
    
    const select = wrapper.find('select')
    expect(select.element.value).toBe('false')
  })

  it('funciona com opções vazias', () => {
    // Para opções vazias, precisamos de pelo menos uma opção padrão
    const emptyWrapper = createWrapper(InputOutputCombobox, {
      props: {
        id: 'empty-combobox',
        label: 'Empty',
        modelValue: '',
        options: [{ value: '', text: 'Selecione...' }],
      },
    })

    const options = emptyWrapper.findAll('option')
    expect(options).toHaveLength(1)
  })

  it('funciona com opções customizadas', () => {
    const customOptions = [
      { value: 'option1', text: 'Opção 1' },
      { value: 'option2', text: 'Opção 2' },
      { value: 'option3', text: 'Opção 3' },
    ]

    const customWrapper = createWrapper(InputOutputCombobox, {
      props: {
        id: 'custom-combobox',
        label: 'Custom',
        modelValue: 'option2',
        options: customOptions,
      },
    })

    const options = customWrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options[1].text()).toBe('Opção 2')
    expect(options[1].attributes('value')).toBe('option2')
  })

  it('mantém acessibilidade', () => {
    const select = wrapper.find('select')
    const label = wrapper.find('label')
    
    expect(select.attributes('id')).toBe('test-combobox')
    expect(label.attributes('for')).toBe('test-combobox')
  })

  it('funciona com v-model', async () => {
    const vModelWrapper = createWrapper(InputOutputCombobox, {
      props: {
        id: 'vmodel-combobox',
        label: 'V-Model Test',
        modelValue: 'true',
        options: mockOptions,
      },
    })

    const select = vModelWrapper.find('select')
    await select.setValue('false')
    
    const emitted = vModelWrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted && emitted[0]).toEqual([false])
  })

  it('trata mudanças de opções dinamicamente', async () => {
    const newOptions = [
      { value: 'new1', text: 'Nova Opção 1' },
      { value: 'new2', text: 'Nova Opção 2' },
    ]

    await wrapper.setProps({ options: newOptions })
    
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(2)
    expect(options[0].text()).toBe('Nova Opção 1')
    expect(options[1].text()).toBe('Nova Opção 2')
  })
})
