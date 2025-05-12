import api from '@/types/api'
import type { Paginated } from '@/types/api'

export interface FornecedorDTO {
  cod_fornecedor?: number
  nome_fornecedor: string
  active: boolean
}

export interface Fornecedor {
  codFornecedor: number
  nomeFornecedor: string
  active: boolean
}

export class SupplierService {
  private baseUrl = '/api/v1/fornecedores/';

  async getSuppliers(page = 1, filters?: { nomeFornecedor?: string; active?: boolean }): Promise<Paginated<Fornecedor>> {
    console.log('SupplierService: Iniciando busca de fornecedores');
    console.log('SupplierService: Filtros recebidos:', filters);
    
    const params = new URLSearchParams({ page: String(page) });
    
    if (filters?.nomeFornecedor) {
      params.append('nomeFornecedor', filters.nomeFornecedor);
    }
    if (filters?.active !== undefined) {
      params.append('active', String(filters.active));
    }
    
    console.log('SupplierService: Params construídos:', params.toString());
    const url = `${this.baseUrl}?${params.toString()}`;
    console.log('SupplierService: URL da requisição:', url);
    
    const { data } = await api.get(url);
    console.log('SupplierService: Resposta da API:', JSON.stringify(data, null, 2));
    
    return data;
  }

  async searchSuppliers(query: string): Promise<Fornecedor[]> {
    const result = await this.getSuppliers(1, { nomeFornecedor: query })
    return result.results
  }

  async updateSupplier(supplier: Fornecedor): Promise<Fornecedor> {
    console.log('SupplierService: Atualizando fornecedor:', supplier);
    if (supplier.codFornecedor === undefined || supplier.codFornecedor === null) {
      throw new Error('Código do fornecedor é obrigatório');
    }
    
    console.log('SupplierService: Payload para atualização:', supplier);
    const { data } = await api.put(`${this.baseUrl}${supplier.codFornecedor}/`, supplier);
    console.log('SupplierService: Resposta da atualização:', data);
    
    return data;
  }

  async deleteSupplier(codFornecedor: number): Promise<void> {
    await api.delete(`${this.baseUrl}${codFornecedor}/`);
  }

  async createSupplier(supplier: Fornecedor): Promise<Fornecedor> {
    console.log('SupplierService: Criando fornecedor:', supplier);
    
    // Para criação, removemos o codFornecedor, pois ele será gerado pelo backend
    const { codFornecedor, ...supplierData } = supplier;
    
    console.log('SupplierService: Payload para criação:', supplierData);
    try {
      const { data } = await api.post(this.baseUrl, supplierData);
      console.log('SupplierService: Resposta da criação:', data);
      
      return data;
    } catch (error) {
      console.error('SupplierService: Erro ao criar fornecedor:', error);
      throw error;
    }
  }
}

export const supplierService = new SupplierService() 