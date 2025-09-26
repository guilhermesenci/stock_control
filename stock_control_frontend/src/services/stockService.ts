import api from './api'
import { type Paginated } from '@/types/api'

export interface StockItemDTO {
  cod_sku: string | number
  descricao_item: string
  unid_medida: string
  active: boolean
  quantity: number
  estimated_consumption_time: string | null
}

/** Modelagem frontend em camelCase */
export interface StockItem {
  codSku: string | number
  descricaoItem: string
  unidMedida: string
  active: boolean
  quantity: number
  estimatedConsumptionTime: string | null
}

class StockService {
  /** Lista itens de estoque paginados, com suporte a filtros e ordenação */
  async getStockItems(page = 1, filters: Partial<{ 
    codSku: string | number; 
    descricaoItem: string; 
    stockDate: string;
    showOnlyStockItems: boolean;
    showOnlyActiveItems: boolean;
    page_size?: number;
    ordering?: string;
  }> = {}): Promise<Paginated<StockItem>> {
    try {
      console.log('StockService: Iniciando busca de itens em estoque')
      console.log('StockService: Filtros recebidos:', filters)
      
      const params = new URLSearchParams({ page: String(page) })
      
      // Usar camelCase diretamente nos parâmetros
      if (filters.codSku) params.append('codSku', String(filters.codSku))
      if (filters.descricaoItem) params.append('descricaoItem', filters.descricaoItem)
      if (filters.stockDate) params.append('stockDate', filters.stockDate)
      if (filters.showOnlyStockItems !== undefined) params.append('showOnlyStockItems', String(filters.showOnlyStockItems))
      if (filters.showOnlyActiveItems !== undefined) params.append('showOnlyActiveItems', String(filters.showOnlyActiveItems))
      
      // Adicionar parâmetros de paginação e ordenação
      if (filters.page_size) params.append('page_size', String(filters.page_size))
      if (filters.ordering) params.append('ordering', filters.ordering)
      
      console.log('StockService: Params construídos:', params.toString())
      
      const url = `/api/v1/stocks/?${params.toString()}`
      console.log('StockService: URL da requisição:', url)
      
      const response = await api.get(url)
      console.log('StockService: Resposta da API:', response.data)
      
      return response.data
    } catch (error) {
      console.error('StockService: Erro ao buscar itens em estoque:', error)
      throw error
    }
  }
}

export const stockService = new StockService() 