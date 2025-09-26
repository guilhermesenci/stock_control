import { BaseService } from './BaseService';
import type { Item, CreateItemData, UpdateItemData, ItemFilters } from '@/types/item';
import type { Paginated } from '@/types/api';

/**
 * Serviço para gerenciar itens
 */
class ItemService extends BaseService<Item, CreateItemData, UpdateItemData, ItemFilters> {
  constructor() {
    super('/api/v1/itens');
  }

  /**
   * Lista itens com filtros específicos
   */
  async getItems(page = 1, filters: Partial<ItemFilters> = {}): Promise<Paginated<Item>> {
    return await this.getAll(page, filters);
  }

  /**
   * Busca item por SKU
   */
  async getItem(codSku: string | number): Promise<Item> {
    return this.getById(codSku);
  }

  /**
   * Cria um novo item
   */
  async createItem(payload: CreateItemData): Promise<Item> {
    return this.create(payload);
  }

  /**
   * Atualiza um item existente
   */
  async updateItem(codSku: string | number, payload: UpdateItemData): Promise<Item> {
    return this.update(codSku, payload);
  }

  /**
   * Remove um item
   */
  async deleteItem(codSku: string | number): Promise<void> {
    return this.delete(codSku);
  }
}

export const itemService = new ItemService()
