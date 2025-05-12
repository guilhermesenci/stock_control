import api from '@/services/api'

export interface StockCost {
  sku: string
  description: string
  quantity: number
  unityMeasure: string
  unitCost: number
  totalCost: number
  active: boolean
  lastEntryCost: number
}

export interface StockCostResponse {
  results: StockCost[]
  total: number
}

export const stockCostService = {
  async getStockCosts(stockDate?: string, filters?: Record<string, any>): Promise<StockCostResponse> {
    try {
      const params = { ...filters, stockDate }
      const response = await api.get('/api/v1/stock-costs/', { params })
      
      // A API já retorna em camelCase, então podemos organizar diretamente
      return {
        results: response.data.results || [],
        total: response.data.count || 0
      }
    } catch (error) {
      console.error('Erro ao buscar custos de estoque:', error)
      throw error
    }
  },
} 