import api from './axios'
import { type Paginated } from '@/types/api'

export interface Item {
  codSku: string | number
  descricaoItem: string
  unidMedida: string
  active: boolean
  quantity?: number
  estimatedConsumptionTime?: string
}

class ItemService {
  /** Lista itens paginados, agora com suporte a filtros */
  async getItems(page = 1, filters: Partial<{ 
    codSku: string | number; 
    descricaoItem: string; 
    unidMedida: string; 
    active: boolean;
    stockDate: string;
    showOnlyStockItems: boolean;
    showOnlyActiveItems: boolean;
  }> = {}): Promise<Paginated<Item>> {
    try {
      console.log('ItemService: Iniciando busca de itens')
      console.log('ItemService: Filtros recebidos:', filters)
      
      const params = new URLSearchParams({ page: String(page) })
      
      // Podemos usar camelCase diretamente nos parâmetros
      if (filters.codSku) params.append('codSku', String(filters.codSku))
      if (filters.descricaoItem) params.append('descricaoItem', filters.descricaoItem)
      if (filters.unidMedida) params.append('unidMedida', filters.unidMedida)
      if (filters.active !== undefined) params.append('active', String(filters.active))
      if (filters.stockDate) params.append('stockDate', filters.stockDate)
      if (filters.showOnlyStockItems) params.append('showOnlyStockItems', String(filters.showOnlyStockItems))
      if (filters.showOnlyActiveItems) params.append('showOnlyActiveItems', String(filters.showOnlyActiveItems))
      
      console.log('ItemService: Params construídos:', params.toString())
      
      const url = `/api/v1/itens/?${params.toString()}`
      console.log('ItemService: URL da requisição:', url)
      
      const response = await api.get(url)
      console.log('ItemService: Resposta da API:', response.data)
      
      return response.data
    } catch (error) {
      console.error('ItemService: Erro ao buscar itens:', error)
      throw error
    }
  }

  /** Detalha um item */
  async getItem(codSku: string | number): Promise<Item> {
    try {
      console.log('ItemService: Buscando item:', codSku)
      const response = await api.get(`/api/v1/itens/${codSku}/`)
      console.log('ItemService: Resposta da API:', response.data)
      return response.data
    } catch (error) {
      console.error('ItemService: Erro ao buscar item:', error)
      throw error
    }
  }

  /** Cria um item novo */
  async createItem(payload: Item): Promise<Item> {
    try {
      console.log('ItemService: Criando item:', payload)
      
      // Não precisamos mais converter para snake_case, podemos enviar diretamente em camelCase
      console.log('ItemService: Payload para API:', payload)
      const response = await api.post('/api/v1/itens/', payload)
      console.log('ItemService: Resposta da API:', response.data)
      
      return response.data
    } catch (error) {
      console.error('ItemService: Erro ao criar item:', error)
      throw error
    }
  }

  /** Atualiza um item existente */
  async updateItem(codSku: string | number, payload: Partial<Item>): Promise<Item> {
    try {
      console.log('ItemService: Atualizando item:', codSku, payload)
      
      // Não precisamos mais converter para snake_case, podemos enviar diretamente em camelCase
      // Adicionar o codSku no payload se não estiver presente
      const dataToSend = { 
        ...payload,
        ...(payload.codSku === undefined ? { codSku: String(codSku) } : {})
      }
      
      console.log('ItemService: Payload para API:', dataToSend)
      const response = await api.put(`/api/v1/itens/${codSku}/`, dataToSend)
      console.log('ItemService: Resposta da API:', response.data)
      
      return response.data
    } catch (error) {
      console.error('ItemService: Erro ao atualizar item:', error)
      throw error
    }
  }

  /** Remove um item */
  async deleteItem(codSku: string | number): Promise<void> {
    try {
      console.log('ItemService: Deletando item:', codSku)
      await api.delete(`/api/v1/itens/${String(codSku)}/`)
      console.log('ItemService: Item deletado com sucesso')
    } catch (error) {
      console.error('ItemService: Erro ao deletar item:', error)
      throw error
    }
  }
}

export const itemService = new ItemService()
