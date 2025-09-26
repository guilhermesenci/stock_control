// src/composables/__tests__/useTable.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useTable, type ColumnDef } from '../useTable'

interface TestItem {
  id: number
  name: string
  status: string
  value: number
}

describe('useTable', () => {
  const mockData: TestItem[] = [
    { id: 1, name: 'Item A', status: 'Ativo', value: 100 },
    { id: 2, name: 'Item B', status: 'Inativo', value: 200 },
    { id: 3, name: 'Item C', status: 'Ativo', value: 150 },
    { id: 4, name: 'Item D', status: 'Pendente', value: 75 },
  ]

  const mockColumns: ColumnDef<TestItem>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'value', label: 'Valor', sortable: true },
  ]

  let rows: any
  let table: any

  beforeEach(() => {
    rows = ref([...mockData])
    table = useTable(rows, mockColumns)
  })

  it('inicializa com valores padrão', () => {
    expect(table.sortKey.value).toBe(null)
    expect(table.sortOrder.value).toBe('asc')
    expect(table.filters.value).toEqual({})
    expect(table.data.value).toEqual(mockData)
  })

  it('inicializa com filtros customizados', () => {
    const initialFilters = { status: 'Ativo' }
    const tableWithFilters = useTable(rows, mockColumns, initialFilters)
    
    expect(tableWithFilters.filters.value).toEqual(initialFilters)
  })

  it('filtra dados corretamente', () => {
    table.setFilter('status', 'Ativo')
    
    const filteredData = table.data.value
    expect(filteredData).toHaveLength(2)
    expect(filteredData.every((item: TestItem) => item.status === 'Ativo')).toBe(true)
  })

  it('filtra por múltiplos campos', () => {
    table.setFilter('status', 'Ativo')
    table.setFilter('name', 'Item A')
    
    const filteredData = table.data.value
    expect(filteredData).toHaveLength(1)
    expect(filteredData[0].name).toBe('Item A')
  })

  it('ordena dados em ordem ascendente', () => {
    table.setSort('name')
    
    const sortedData = table.data.value
    expect(sortedData[0].name).toBe('Item A')
    expect(sortedData[1].name).toBe('Item B')
    expect(sortedData[2].name).toBe('Item C')
    expect(sortedData[3].name).toBe('Item D')
  })

  it('ordena dados em ordem descendente', () => {
    table.setSort('name')
    table.setSort('name') // Segunda chamada inverte a ordem
    
    const sortedData = table.data.value
    expect(sortedData[0].name).toBe('Item D')
    expect(sortedData[1].name).toBe('Item C')
    expect(sortedData[2].name).toBe('Item B')
    expect(sortedData[3].name).toBe('Item A')
  })

  it('ordena por coluna diferente', () => {
    table.setSort('value')
    
    const sortedData = table.data.value
    expect(sortedData[0].value).toBe(75)
    expect(sortedData[1].value).toBe(100)
    expect(sortedData[2].value).toBe(150)
    expect(sortedData[3].value).toBe(200)
  })

  it('combina filtros e ordenação', () => {
    table.setFilter('status', 'Ativo')
    table.setSort('value')
    
    const filteredAndSorted = table.data.value
    expect(filteredAndSorted).toHaveLength(2)
    expect(filteredAndSorted[0].value).toBe(100) // Item A
    expect(filteredAndSorted[1].value).toBe(150) // Item C
  })

  it('ignora ordenação em colunas não sortáveis', () => {
    const nonSortableColumns: ColumnDef<TestItem>[] = [
      { key: 'id', label: 'ID', sortable: false },
      { key: 'name', label: 'Nome', sortable: true },
    ]
    
    const tableNonSortable = useTable(rows, nonSortableColumns)
    tableNonSortable.setSort('id')
    
    // Não deve ordenar por ID pois não é sortável
    expect(tableNonSortable.sortKey.value).toBe('id')
    expect(tableNonSortable.data.value).toEqual(mockData) // Dados inalterados
  })

  it('usa função de ordenação customizada', () => {
    const customSortColumns: ColumnDef<TestItem>[] = [
      { 
        key: 'name', 
        label: 'Nome', 
        sortable: true,
        sortFn: (a, b, order) => {
          const result = a.name.localeCompare(b.name)
          return order === 'asc' ? result : -result
        }
      },
    ]
    
    const tableCustomSort = useTable(rows, customSortColumns)
    tableCustomSort.setSort('name')
    
    const sortedData = tableCustomSort.data.value
    expect(sortedData[0].name).toBe('Item A')
    expect(sortedData[3].name).toBe('Item D')
  })

  it('atualiza dados quando rows mudam', () => {
    const newData = [...mockData, { id: 5, name: 'Item E', status: 'Ativo', value: 300 }]
    rows.value = newData
    
    expect(table.data.value).toHaveLength(5)
    expect(table.data.value[4].name).toBe('Item E')
  })

  it('mantém filtros quando dados mudam', () => {
    table.setFilter('status', 'Ativo')
    const newData = [...mockData, { id: 5, name: 'Item E', status: 'Ativo', value: 300 }]
    rows.value = newData
    
    const filteredData = table.data.value
    expect(filteredData).toHaveLength(3) // 2 originais + 1 novo
    expect(filteredData.every((item: TestItem) => item.status === 'Ativo')).toBe(true)
  })

  it('limpa filtros corretamente', () => {
    table.setFilter('status', 'Ativo')
    table.setFilter('name', 'Item A')
    
    expect(table.data.value).toHaveLength(1)
    
    table.setFilter('status', '')
    expect(table.data.value).toHaveLength(1) // Ainda filtrado por nome
    
    table.setFilter('name', '')
    expect(table.data.value).toHaveLength(4) // Todos os dados
  })

  it('funciona com dados vazios', () => {
    const emptyRows = ref([])
    const emptyTable = useTable(emptyRows, mockColumns)
    
    expect(emptyTable.data.value).toEqual([])
    expect(emptyTable.sortKey.value).toBe(null)
  })

  it('funciona com colunas vazias', () => {
    const emptyColumns: ColumnDef<TestItem>[] = []
    const emptyTable = useTable(rows, emptyColumns)
    
    expect(emptyTable.data.value).toEqual(mockData)
  })

  it('trata valores undefined/null nos filtros', () => {
    table.setFilter('status', undefined as any)
    table.setFilter('name', null as any)
    
    expect(table.data.value).toEqual(mockData) // Não deve filtrar
  })

  it('converte valores para string na filtragem', () => {
    table.setFilter('id', '1')
    
    const filteredData = table.data.value
    expect(filteredData).toHaveLength(1)
    expect(filteredData[0].id).toBe(1)
  })
})
