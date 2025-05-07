// useTable.ts
import { ref, computed } from 'vue';
import type { Ref } from 'vue';

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  /** para colunas com ordenação customizada */
  sortFn?: (a: T, b: T, order: 'asc' | 'desc') => number;
}

export function useTable<T extends Record<string, any>>(
  rows: Ref<T[]>,
  columns: ColumnDef<T>[], // agora recebemos colunas
  initialFilters: Record<string, string> = {}
) {
  const sortKey = ref<keyof T | null>(null);
  const sortOrder = ref<'asc' | 'desc'>('asc');
  const filters = ref({ ...initialFilters });

  const filteredAndSorted = computed(() => {
    console.log('useTable: Computando dados filtrados e ordenados');
    console.log('useTable: Dados originais:', rows.value);
    
    let list = [...rows.value];

    // filtragem via includes
    Object.entries(filters.value).forEach(([field, substr]) => {
      if (substr) {
        list = list.filter(item =>
          String(item[field as keyof T]).includes(substr)
        );
      }
    });

    // ordenação
    if (sortKey.value) {
      const colDef = columns.find(c => c.key === sortKey.value);
      if (colDef && colDef.sortable) {
        if (colDef.sortFn) {
          list.sort((a, b) => colDef.sortFn!(a, b, sortOrder.value));
        } else {
          list.sort((a, b) => {
            const aV = a[sortKey.value!];
            const bV = b[sortKey.value!];
            if (aV < bV) return sortOrder.value === 'asc' ? -1 : 1;
            if (aV > bV) return sortOrder.value === 'asc' ? 1 : -1;
            return 0;
          });
        }
      }
    }

    console.log('useTable: Dados processados:', list);
    return list;
  });

  function setSort(key: keyof T) {
    console.log('useTable: Definindo ordenação:', key);
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
  }

  function setFilter(field: string, value: string) {
    console.log('useTable: Definindo filtro:', field, value);
    filters.value[field] = value;
  }

  return {
    sortKey,
    sortOrder,
    filters,
    data: filteredAndSorted,
    setSort,
    setFilter,
  };
}
