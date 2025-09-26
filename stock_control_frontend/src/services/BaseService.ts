// services/BaseService.ts - Classe base para serviços
import api from './api';
import type { Paginated } from '@/types/api';

/**
 * Classe base para serviços com funcionalidades comuns
 */
export abstract class BaseService<T, CreateData, UpdateData, Filters = any> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Lista todos os itens com paginação e filtros
   */
  async getAll(page = 1, filters: Partial<Filters> = {}): Promise<Paginated<T>> {
    try {
      const params = new URLSearchParams();
      
      // Adiciona o parâmetro de página
      params.append('page', page.toString());
      
      // Adiciona filtros aos parâmetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const url = `${this.baseUrl}/?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ${this.baseUrl}:`, error);
      throw error;
    }
  }

  /**
   * Busca um item por ID
   */
  async getById(id: string | number): Promise<T> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo item
   */
  async create(data: CreateData): Promise<T> {
    try {
      const response = await api.post(`${this.baseUrl}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar item:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um item existente
   */
  async update(id: string | number, data: UpdateData): Promise<T> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza parcialmente um item
   */
  async patch(id: string | number, data: Partial<UpdateData>): Promise<T> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar parcialmente item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove um item
   */
  async delete(id: string | number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}/`);
    } catch (error) {
      console.error(`Erro ao deletar item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca itens com termo de pesquisa
   */
  async search(term: string): Promise<T[]> {
    try {
      const response = await api.get(`${this.baseUrl}/?search=${encodeURIComponent(term)}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error(`Erro ao buscar ${this.baseUrl}:`, error);
      throw error;
    }
  }
}
