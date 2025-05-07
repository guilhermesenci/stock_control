import api from './axios'
import { mapPaginated, type Paginated } from '@/types/api'

export interface ItemDTO {
  cod_sku: string | number
  descricao_item: string
  unid_medida: string
  active?: boolean
}

/** Modelagem frontend em camelCase */
export interface Item {
  codSku: string | number
  descricaoItem: string
  unidMedida: string
  active: boolean
}

class ItemService {
  /** Lista itens paginados, agora com suporte a filtros */
  async getItems(page = 1, filters: Partial<{ codSku: string | number; descricaoItem: string; unidMedida: string; active: boolean }> = {}): Promise<Paginated<Item>> {
    try {
      console.log('ItemService: Iniciando busca de itens')
      console.log('ItemService: Filtros recebidos:', filters)
      
      const params = new URLSearchParams({ page: String(page) })
      
      // Converte os nomes dos campos para o formato que o backend espera
      if (filters.codSku) params.append('cod_sku', String(filters.codSku))
      if (filters.descricaoItem) params.append('descricao_item', filters.descricaoItem)
      if (filters.unidMedida) params.append('unid_medida', filters.unidMedida)
      if (filters.active !== undefined) params.append('active', String(filters.active))
      
      console.log('ItemService: Params construídos:', params.toString())
      
      const url = `/api/v1/itens/?${params.toString()}`
      console.log('ItemService: URL da requisição:', url)
      
      const response = await api.get(url)
      console.log('ItemService: Resposta da API:', response.data)
      
      return mapPaginated(response.data, (item: ItemDTO) => ({
        codSku: item.cod_sku,
        descricaoItem: item.descricao_item,
        unidMedida: item.unid_medida,
        active: item.active ?? true,
      }))
    } catch (error) {
      console.error('ItemService: Erro ao buscar itens:', error)
      throw error
    }
  }

  /** Detalha um item */
  async getItem(codSku: string | number): Promise<Item> {
    try {
      console.log('ItemService: Buscando item:', codSku)
      const response = await api.get<ItemDTO>(`/api/v1/itens/${codSku}/`)
      console.log('ItemService: Resposta da API:', response.data)
      return {
        codSku: response.data.cod_sku,
        descricaoItem: response.data.descricao_item,
        unidMedida: response.data.unid_medida,
        active: response.data.active ?? true,
      }
    } catch (error) {
      console.error('ItemService: Erro ao buscar item:', error)
      throw error
    }
  }

  /** Cria um item novo */
  async createItem(payload: Item): Promise<Item> {
    try {
      console.log('ItemService: Criando item:', payload)
      const dto = {
        cod_sku: String(payload.codSku),
        descricao_item: payload.descricaoItem,
        unid_medida: payload.unidMedida,
        active: payload.active,
      }
      console.log('ItemService: DTO para API:', dto)
      const response = await api.post<ItemDTO>('/api/v1/itens/', dto)
      console.log('ItemService: Resposta da API:', response.data)
      return {
        codSku: response.data.cod_sku,
        descricaoItem: response.data.descricao_item,
        unidMedida: response.data.unid_medida,
        active: response.data.active ?? true,
      }
    } catch (error) {
      console.error('ItemService: Erro ao criar item:', error)
      throw error
    }
  }

  /** Atualiza um item existente */
  async updateItem(codSku: string | number, payload: Partial<Item>): Promise<Item> {
    try {
      console.log('ItemService: Atualizando item:', codSku, payload)
      const dto: Partial<ItemDTO> = {
        cod_sku: String(codSku), // Converte para string para garantir
      }
      if (payload.descricaoItem !== undefined) dto.descricao_item = payload.descricaoItem
      if (payload.unidMedida !== undefined) dto.unid_medida = payload.unidMedida
      if (payload.active !== undefined) dto.active = payload.active

      const response = await api.put<ItemDTO>(`/api/v1/itens/${codSku}/`, dto)
      console.log('ItemService: Resposta da API:', response.data)
      return {
        codSku: response.data.cod_sku,
        descricaoItem: response.data.descricao_item,
        unidMedida: response.data.unid_medida,
        active: response.data.active ?? true,
      }
    } catch (error) {
      console.error('ItemService: Erro ao atualizar item:', error)
      throw error
    }
  }

  /** Remove um item */
  async deleteItem(codSku: number): Promise<void> {
    try {
      console.log('ItemService: Deletando item:', codSku)
      await api.delete(`/api/v1/itens/${codSku}/`)
      console.log('ItemService: Item deletado com sucesso')
    } catch (error) {
      console.error('ItemService: Erro ao deletar item:', error)
      throw error
    }
  }
}

export const itemService = new ItemService()
