// src/components/__tests__/BaseTable.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createWrapper } from '@/test/utils'
import BaseTable from '../BaseTable.vue'

describe('BaseTable', () => {
  const mockColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ]

  const mockRows = [
    { id: 1, name: 'Item 1', status: 'Ativo' },
    { id: 2, name: 'Item 2', status: 'Inativo' },
    { id: 3, name: 'Item 3', status: 'Ativo' },
  ]

  let wrapper: any

  beforeEach(() => {
    wrapper = createWrapper(BaseTable, {
      props: {
        columns: mockColumns,
        rows: mockRows,
        sortKey: null,
        sortOrder: 'asc',
        keyField: 'id',
      },
    })
  })

  it('renderiza corretamente', () => {
    expect(wrapper.find('.table-container').exists()).toBe(true)
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('renderiza todas as colunas no cabeçalho', () => {
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toBe('ID ⇅')
    expect(headers[1].text()).toBe('Nome ⇅')
    expect(headers[2].text()).toBe('Status')
  })

  it('renderiza todas as linhas de dados', () => {
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('renderiza dados corretos nas células', () => {
    const firstRow = wrapper.find('tbody tr')
    const cells = firstRow.findAll('td')
    expect(cells[0].text()).toBe('1')
    expect(cells[1].text()).toBe('Item 1')
    expect(cells[2].text()).toBe('Ativo')
  })

  it('aplica classe sortable apenas em colunas sortáveis', () => {
    const headers = wrapper.findAll('th')
    expect(headers[0].classes()).toContain('sortable')
    expect(headers[1].classes()).toContain('sortable')
    expect(headers[2].classes()).not.toContain('sortable')
  })

  it('emite evento de ordenação ao clicar em coluna sortável', async () => {
    const sortableHeader = wrapper.find('th.sortable')
    await sortableHeader.trigger('click')
    
    expect(wrapper.emitted('update:sort')).toBeTruthy()
    expect(wrapper.emitted('update:sort')[0]).toEqual(['id'])
  })

  it('não emite evento ao clicar em coluna não sortável', async () => {
    const nonSortableHeader = wrapper.findAll('th')[2] // Status column
    await nonSortableHeader.trigger('click')
    
    expect(wrapper.emitted('update:sort')).toBeFalsy()
  })

  it('mostra ícone de ordenação corretamente', async () => {
    // Testa sem ordenação ativa
    let sortIcon = wrapper.find('th span')
    expect(sortIcon.text()).toBe('⇅')

    // Testa com ordenação ascendente
    await wrapper.setProps({ sortKey: 'id', sortOrder: 'asc' })
    sortIcon = wrapper.find('th span')
    expect(sortIcon.text()).toBe('⬆')

    // Testa com ordenação descendente
    await wrapper.setProps({ sortKey: 'id', sortOrder: 'desc' })
    sortIcon = wrapper.find('th span')
    expect(sortIcon.text()).toBe('⬇')
  })

  it('aplica classe active na coluna ordenada', async () => {
    await wrapper.setProps({ sortKey: 'name', sortOrder: 'asc' })
    const headers = wrapper.findAll('th')
    expect(headers[1].classes()).toContain('active')
    expect(headers[0].classes()).not.toContain('active')
  })

  it('permite slots customizados para células', () => {
    const wrapperWithSlot = createWrapper(BaseTable, {
      props: {
        columns: mockColumns,
        rows: mockRows,
        sortKey: null,
        sortOrder: 'asc',
        keyField: 'id',
      },
      slots: {
        'cell-status': '<span class="custom-status">{{ value }}</span>',
      },
    })

    const customCell = wrapperWithSlot.find('.custom-status')
    expect(customCell.exists()).toBe(true)
    expect(customCell.text()).toBe('Ativo')
  })

  it('funciona com dados vazios', () => {
    const emptyWrapper = createWrapper(BaseTable, {
      props: {
        columns: mockColumns,
        rows: [],
        sortKey: null,
        sortOrder: 'asc',
        keyField: 'id',
      },
    })

    expect(emptyWrapper.find('tbody tr').exists()).toBe(false)
  })

  it('funciona com colunas vazias', () => {
    const emptyColumnsWrapper = createWrapper(BaseTable, {
      props: {
        columns: [],
        rows: mockRows,
        sortKey: null,
        sortOrder: 'asc',
        keyField: 'id',
      },
    })

    expect(emptyColumnsWrapper.find('th').exists()).toBe(false)
  })
})
