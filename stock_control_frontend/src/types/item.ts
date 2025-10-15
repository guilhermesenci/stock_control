// types/item.ts
import type { ActivatableEntity } from './common';

/**
 * Interface para Item vinda da API (snake_case)
 */
export interface ItemDTO {
  cod_sku: string;
  descricao_item: string;
  unid_medida: string;
  active?: boolean;
}

/**
 * Interface para Item processado (camelCase)
 */
export interface Item extends ActivatableEntity {
  codSku: string;
  descricaoItem: string;
  unidMedida: string;
  quantity?: number;
  estimatedConsumptionTime?: string;
  page: any;
  edit: any;
  delete: any;
}

/**
 * Interface para criação de item
 */
export interface CreateItemData {
  codSku: string;
  descricaoItem: string;
  unidMedida: string;
  active?: boolean;
}

/**
 * Interface para atualização de item
 */
export interface UpdateItemData {
  descricaoItem?: string;
  unidMedida?: string;
  active?: boolean;
}

/**
 * Interface para filtros de item
 */
export interface ItemFilters {
  codSku?: string;
  descricaoItem?: string;
  unidMedida?: string;
  active?: boolean;
  stockDate?: string;
  showOnlyStockItems?: boolean;
  showOnlyActiveItems?: boolean;
  page: any;
} 