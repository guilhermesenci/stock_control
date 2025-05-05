export type FilterType = 'text' | 'date' | 'number' | 'checkbox';

export interface FilterField<T = any> {
  key: keyof T;
  label: string;
  type: FilterType;
  placeholder?: string;
}