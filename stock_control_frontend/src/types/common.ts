// types/common.ts - Tipos comuns e base da aplicação

/**
 * Interface base para entidades com ID
 */
export interface BaseEntity {
  id: number;
}

/**
 * Interface para entidades que podem ser ativadas/desativadas
 */
export interface ActivatableEntity extends BaseEntity {
  active: boolean;
}

/**
 * Interface para entidades com timestamps
 */
export interface TimestampedEntity extends BaseEntity {
  createdAt: string;
  updatedAt: string;
}

/**
 * Status de carregamento para operações assíncronas
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Direção de ordenação
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Tipo de filtro para formulários
 */
export type FilterType = 'text' | 'date' | 'number' | 'checkbox' | 'select';

/**
 * Interface base para filtros
 */
export interface BaseFilter {
  [key: string]: any;
}

/**
 * Interface para campos de filtro
 */
export interface FilterField<T = any> {
  key: keyof T;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>;
}

/**
 * Interface para definição de colunas de tabela
 */
export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Interface para ações de tabela
 */
export interface TableAction<T> {
  label: string;
  icon?: string;
  handler: (item: T) => void;
  condition?: (item: T) => boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}
