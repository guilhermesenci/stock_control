import api from '@/types/api'
import { mapPaginated, type Paginated } from '@/types/api'

export interface ItemDTO {
  cod_sku: number
  descricao_item: string
  unid_medida: string
}

/** Modelagem frontend em camelCase */
export interface Item {
  codSku: number
  descricaoItem: string
  unidMedida: string
}

class ItemService {
  /** Lista itens paginados */
  async getItems(page = 1): Promise<Paginated<Item>> {
    const { data } = await api.get(`/vi/itens/?page=${page}`)
    return mapPaginated<ItemDTO, Item>(data, (i) => ({
      codSku: i.cod_sku,
      descricaoItem: i.descricao_item,
      unidMedida: i.unid_medida,
    }))
  }

  /** Detalha um item */
  async getItem(codSku: number): Promise<Item> {
    const { data } = await api.get<ItemDTO>(`/vi/itens/${codSku}/`)
    return {
      codSku: data.cod_sku,
      descricaoItem: data.descricao_item,
      unidMedida: data.unid_medida,
    }
  }

  /** Cria um item novo */
  async createItem(payload: Omit<Item, 'codSku'>): Promise<Item> {
    const dto = {
      cod_sku: 0, // backend ignora ou atribui
      descricao_item: payload.descricaoItem,
      unid_medida: payload.unidMedida,
    }
    const { data } = await api.post<ItemDTO>('/vi/itens/', dto)
    return {
      codSku: data.cod_sku,
      descricaoItem: data.descricao_item,
      unidMedida: data.unid_medida,
    }
  }

  /** Atualiza um item existente */
  async updateItem(codSku: number, payload: Partial<Omit<Item, 'codSku'>>): Promise<Item> {
    const dto: Partial<ItemDTO> = {}
    if (payload.descricaoItem !== undefined) dto.descricao_item = payload.descricaoItem
    if (payload.unidMedida    !== undefined) dto.unid_medida    = payload.unidMedida

    const { data } = await api.put<ItemDTO>(`/vi/itens/${codSku}/`, dto)
    return {
      codSku: data.cod_sku,
      descricaoItem: data.descricao_item,
      unidMedida: data.unid_medida,
    }
  }

  /** Remove um item */
  async deleteItem(codSku: number): Promise<void> {
    await api.delete(`/vi/itens/${codSku}/`)
  }
}

export const itemService = new ItemService()
