import api from './api';
import type { AxiosResponse } from 'axios';

export interface Item {
  cod_sku: number;
  descricao_item: string;
  unid_medida: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

class ItemService {
  /** Busca a lista de itens (paginação opcional) */
  async getItems(page = 1): Promise<PaginatedResponse<Item>> {
    const res: AxiosResponse<PaginatedResponse<Item>> = await api.get(
      `/vi/itens/?page=${page}`
    );
    return res.data;
  }

  /** Busca um único item pelo SKU */
  async getItem(cod_sku: number): Promise<Item> {
    const res: AxiosResponse<Item> = await api.get(`/vi/itens/${cod_sku}/`);
    return res.data;
  }

  /** Cria um novo item */
  async createItem(item: Item): Promise<Item> {
    const res: AxiosResponse<Item> = await api.post(`/vi/itens/`, item);
    return res.data;
  }

  /** Atualiza um item existente */
  async updateItem(cod_sku: number, data: Partial<Omit<Item, 'cod_sku'>>): Promise<Item> {
    const payload = { cod_sku, ...data };
    const res: AxiosResponse<Item> = await api.put(
      `/vi/itens/${cod_sku}/`,
      payload
    );
    return res.data;
  }

  /** Deleta um item */
  async deleteItem(cod_sku: number): Promise<void> {
    await api.delete(`/vi/itens/${cod_sku}/`);
  }
}

export const itemService = new ItemService();
