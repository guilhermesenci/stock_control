export interface ColumnDef<T> {
  key: keyof T | string
  label: string
  sortable: boolean
} 